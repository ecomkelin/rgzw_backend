const DAO = require('@models/DAO');
const { OrderPackModel, OrderPackEnums, OrderPackDOC } = require('./OrderPack.model');
const { AccountModel } = require('@models/authorization/Account.dao');
const { StudentModel } = require('@models/school/student/Student.dao');
const { CourseModel } = require('@models/school/course/Course.dao');
const { PackModel } = require('./Pack.dao');
const { userPayloadChecker, studentPayloadChecker, payloadChecker } = require("@utils/payloadChecker")

const list = async (payload = {}, filter, options) => {
  try {
    // 验证权限
    if (payload.accountType === 'Student') {
      studentPayloadChecker(payload);
      // 学生只能看自己的订单
      filter.Account = payload._id;
    } else if (payload.accountType === 'User') {
      userPayloadChecker(payload);
      // 用户需是管理员或经理
      if (payload.currentUser.roleTemp !== 'manager') {
        throw ({ code: 403, message: "您无权查看课包订单列表" });
      }
      if (!payload.isAdmin) {
        filter.Org = payload.currentUser.Org;
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    const { items, total } = await DAO.list(OrderPackModel, filter, options);
    return { items, total };
  } catch (e) {
    console.error('OrderPackDao list error:', e);
    throw e;
  }
};

const detail = async (payload = {}, _id, options) => {
  try {
    const { item } = await DAO.detail(OrderPackModel, _id, options);

    if (!item) {
      throw ({ code: 404, message: "此 课包订单 数据已不存在" });
    }

    // 验证权限
    if (payload.accountType === 'Student') {
      studentPayloadChecker(payload);
      // 学生只能查看自己相关的订单
      if (item.Account.toString() !== payload._id.toString()) {
        throw ({ code: 403, message: "您无权查看此订单" });
      }
    } else if (payload.accountType === 'User') {
      userPayloadChecker(payload);
      if (!payload.isAdmin) {
        if (item.Org.toString() !== payload.currentUser.Org.toString()) {
          throw ({ code: 403, message: "您无权查看此订单" });
        }
      }
      if (payload.currentUser.roleTemp !== 'manager') {
        throw ({ code: 403, message: "您无权查看课包订单" });
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    return { item };
  } catch (e) {
    console.error('OrderPackDao detail error:', e);
    throw e;
  }
};

/**
 *
 * @param {*} payload
 * @param {*} doc
 * @param {*} options: {session} 事务
 * @returns
 */
const add = async (payload, doc, options) => {
  try {
    if (payload.accountType === 'User') {
      userPayloadChecker(payload);
      doc.Org = payload.currentUser.Org;
      // 只有管理员可以创建订单
      if (payload.currentUser.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有管理员才能创建课包订单" });
      }
    } else if (payload.accountType === 'Student') {
      studentPayloadChecker(payload)
      doc.Student = payload.currentStudent._id;
      doc.Org = payload.currentStudent.Org;
    }

    // 验证Student存在性
    if (!doc.Student) {
      throw ({ code: 400, message: "订单必须关联学生" });
    }
    const student = await StudentModel.findById(doc.Student);
    if (!student || !student.isActive) {
      throw ({ code: 404, message: "指定的学生不存在或被禁用" });
    }
    if (student.Org.toString() !== doc.Org.toString()) {
      throw ({ code: 404, message: "您与该学生不在同一校区,无法下单" });
    }

    // Account 由 Student.Account 自动推导(避免前端传错或绕过学生身份)
    if (!student.Account) {
      throw ({ code: 400, message: "该学生未关联账户,无法下单" });
    }
    const account = await AccountModel.findById(student.Account);
    if (!account || !account.isActive) {
      throw ({ code: 404, message: "学生关联的账户不存在或账号被禁用" });
    }

    if (!doc.Pack) {
      throw ({ code: 400, message: "订单必须关联课包" });
    }
    const pack = await PackModel.findById(doc.Pack);
    if (!pack || !pack.isActive) {
      throw ({ code: 404, message: "指定的课包不存在或被禁用" });
    }
    if (pack.Org.toString() !== doc.Org.toString()) {
      throw ({ code: 404, message: "制定的课包与该学生不在同一校区,无法下单" });
    }

    if (doc.Course) {
      const course = await CourseModel.findById(doc.Course);
      if (!course || !course.isActive) {
        throw ({ code: 404, message: "指定的课程不存在或被禁用" });
      }
      if (course.Org.toString() !== doc.Org.toString()) {
        throw ({ code: 404, message: "指定的课程与该学生不在同一校区,无法下单" });
      }
    }


    // 设置从Pack获取的快照数据
    doc.packName = pack.name;
    doc.totalLesson = pack.totalLesson;
    doc.validDays = pack.validDays;
    doc.priceOrigin = pack.priceOrigin;
    doc.priceRegular = pack.priceRegular;
    doc.priceSale = pack.priceSale;

    doc.Account = student.Account;
    // 确保 Org 和 createdBy 字段正确设置
    doc.createdBy = payload.currentUser._id;

    const { item } = await DAO.add(OrderPackModel, doc, options);
    return { item };
  } catch (e) {
    console.error('OrderPackDao create error:', e);
    throw e;
  }
};

const edit = async (payload = {}, _id, doc, options) => {
  try {
    userPayloadChecker(payload);
    if (!payload.isAdmin) {
      throw ({ code: 403, message: "只有管理员能够修改课包订单" });
    }
    // 验证目标订单是否存在
    const targetOrder = await OrderPackModel.findById(_id);
    if (!targetOrder) {
      throw ({ code: 404, message: '课包订单不存在' });
    }
    if (targetOrder.Org.toString() !== payload.currentUser.Org.toString()) {
      throw ({ code: 404, message: '您的身份不能修改其他学校的课包订单信息' });
    }

    // 更新订单状态等信息
    if (doc.payStatus === 'Paid' && !targetOrder.paidAt) {
      doc.paidAt = new Date(); // 设置支付时间为当前时间
    }

    targetOrder.set(doc);
    const { item } = await DAO.edit(targetOrder, options);

    return { item };

  } catch (e) {
    console.error('OrderPackDao update error:', e);
    throw e;
  }
};

// OrderPack 不能被删除 remove 只需要在 把 isActive 修改为 false

module.exports = {
  OrderPackDAO: {
    list,
    detail,
    add,
    edit,
  },
  OrderPackModel, OrderPackDOC, OrderPackEnums,
}