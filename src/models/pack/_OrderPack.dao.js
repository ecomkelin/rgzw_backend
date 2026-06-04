const DAO = require('@models/DAO');
const { OrderPackModel, OrderPackEnums, OrderPackDOC } = require('./OrderPack.model');
const { AccountModel } = require('@models/authorization/Account.dao');
const { StudentModel } = require('@models/school/student/Student.dao');
const { PackModel } = require('./Pack.dao');

const list = async (payload = {}, filter, options) => {
  try {
    // 验证权限
    if (payload.accountType === 'Student') {
      // 学生只能看自己的订单
      const student = payload.currentStudent;
      if (!student) {
        throw ({ code: 403, message: "学生信息无效" });
      }
      filter.Student = student._id;
    } else if (payload.accountType === 'User') {
      // 用户需是管理员或经理
      if (!payload.isAdmin) {
        if (payload.currentUser.roleTemp !== 'manager') {
          throw ({ code: 403, message: "您无权查看课包订单列表" });
        }
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
      // 学生只能查看自己相关的订单
      const student = payload.currentStudent;
      if (!student || item.Student.toString() !== student._id.toString()) {
        throw ({ code: 403, message: "您无权查看此订单" });
      }
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (item.Org.toString() !== payload.currentUser.Org.toString()) {
          throw ({ code: 403, message: "您无权查看此订单" });
        }
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
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "您无权添加课包订单" });
    }

    // 只有管理员可以创建订单
    if (!payload.isAdmin) {
      if (payload.currentUser.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有管理员才能创建课包订单" });
      }
    }

    // 验证Account和Student存在性
    if (!doc.Account) {
      throw ({ code: 400, message: "订单必须关联账号" });
    }
    const account = await AccountModel.findById(doc.Account);
    if (!account) {
      throw ({ code: 404, message: "指定的账号不存在" });
    }

    if (!doc.Student) {
      throw ({ code: 400, message: "订单必须关联学生" });
    }
    const student = await StudentModel.findById(doc.Student);
    if (!student) {
      throw ({ code: 404, message: "指定的学生不存在" });
    }

    if (!doc.Pack) {
      throw ({ code: 400, message: "订单必须关联课包" });
    }
    const pack = await PackModel.findById(doc.Pack);
    if (!pack) {
      throw ({ code: 404, message: "指定的课包不存在" });
    }

    // 设置从Pack获取的快照数据
    doc.packName = pack.name;
    doc.totalLesson = pack.totalLesson;
    doc.validDays = pack.validDays;
    doc.priceOrigin = pack.priceOrigin;
    doc.priceRegular = pack.priceRegular;
    doc.priceSale = pack.priceSale;

    // 确保 Org 和 createdBy 字段正确设置
    doc.Org = payload.currentUser.Org;
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
    // 验证目标订单是否存在
    const targetOrder = await OrderPackModel.findById(_id);
    if (!targetOrder) {
      throw ({ code: 404, message: '课包订单不存在' });
    }

    // 验证权限
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "您无权修改课包订单" });
    }
    if (!payload.isAdmin) {
      if (payload.currentUser.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有管理员才能修改课包订单" });
      }
      if (targetOrder.Org.toString() !== payload.currentUser.Org.toString()) {
        throw ({ code: 403, message: "您无权修改此订单" });
      }
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