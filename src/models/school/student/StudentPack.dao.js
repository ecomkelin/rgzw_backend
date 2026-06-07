const DAO = require('@models/DAO');
const { StudentPackModel, StudentPackEnums, StudentPackDOC } = require('./StudentPack.model');
const { AccountModel } = require('@models/authorization/Account.dao');
const { StudentModel } = require('./Student.dao');
const {
  userPayloadChecker,
  studentPayloadChecker,
} = require('@utils/payloadChecker');

/**
 * StudentPack 数据访问层
 *
 * 权限矩阵(与 OrderPack 保持一致, 超管看全部, 经理看本 Org, 学生看自己):
 *   - list   : Student 看自己 / manager 看本 Org / isAdmin 全平台
 *   - detail : Student 看自己 / manager 看本 Org / isAdmin 全平台
 *   - add    : 仅 isAdmin; 仅手动添加 resource='free' 的赠送课包
 *   - edit   : 仅 isAdmin
 *
 * OrderPack 来源的 StudentPack 由 createFromOrderPack 内部创建, 业务代码不直接调用 add.
 */
const list = async (payload = {}, filter, options) => {
  try {
    if (payload.accountType === 'Student') {
      studentPayloadChecker(payload);
      // 学生只能查看自己的课包
      filter.Student = payload.currentStudent._id;
    } else if (payload.accountType === 'User') {
      userPayloadChecker(payload);
      // 普通老师无权查看学生课包列表
      if (payload.currentUser.roleTemp !== 'manager') {
        throw ({ code: 403, message: "您无权查看学生课包列表" });
      }
      // 非超管自动 Org 隔离
      if (!payload.isAdmin) {
        filter.Org = payload.currentUser.Org;
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    const { items, total } = await DAO.list(StudentPackModel, filter, options);
    return { items, total };
  } catch (e) {
    console.error('StudentPackDao list error:', e);
    throw e;
  }
};

const detail = async (payload = {}, _id, options) => {
  try {
    const { item } = await DAO.detail(StudentPackModel, _id, options);

    if (!item) {
      throw ({ code: 404, message: "此 学生课包 数据已不存在" });
    }

    if (payload.accountType === 'Student') {
      studentPayloadChecker(payload);
      // 学生只能查看自己的课包
      if (item.Student.toString() !== payload.currentStudent._id.toString()) {
        throw ({ code: 403, message: "您无权查看此学生课包" });
      }
    } else if (payload.accountType === 'User') {
      userPayloadChecker(payload);
      // 仅 manager / admin 可查看
      if (payload.currentUser.roleTemp !== 'manager') {
        throw ({ code: 403, message: "您无权查看此学生课包" });
      }
      // 非超管: Org 隔离
      if (!payload.isAdmin) {
        if (item.Org.toString() !== payload.currentUser.Org.toString()) {
          throw ({ code: 403, message: "您无权查看其他校区的学生课包" });
        }
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    return { item };
  } catch (e) {
    console.error('StudentPackDao detail error:', e);
    throw e;
  }
};

/**
 * 手动添加 free 赠送课包
 * - 仅 isAdmin 可调用
 * - 必填: Student / totalLesson
 * - 自动注入: Account / Org / resource / remainingLesson / activeDate / expireDate / status / packName / createdBy
 */
const add = async (payload, doc, options) => {
  try {
    // 仅 User 可手动添加
    userPayloadChecker(payload);

    // 必须是超管 (业务规则: 经理不参与手动赠送)
    if (!payload.isAdmin) {
      throw ({ code: 403, message: "只有超管才能手动添加学生课包" });
    }

    // 必填
    if (!doc.Student) {
      throw ({ code: 400, message: "必须指定学生" });
    }
    const student = await StudentModel.findById(doc.Student);
    if (!student || !student.isActive) {
      throw ({ code: 404, message: "指定的学生不存在或被禁用" });
    }
    if (student.Org.toString() !== payload.currentUser.Org.toString()) {
      throw ({ code: 403, message: "您只能为本公司学生添加课包" });
    }
    if (!student.Account) {
      throw ({ code: 400, message: "该学生未关联账户,无法添加课包" });
    }
    const account = await AccountModel.findById(student.Account);
    if (!account || !account.isActive) {
      throw ({ code: 404, message: "学生关联的账户不存在或被禁用" });
    }
    console.log(1111, doc);

    // totalLesson 必填 (validator 已校验, 这里再保护一次)
    if (doc.totalLesson === undefined || doc.totalLesson === null) {
      throw ({ code: 400, message: "totalLesson 必填" });
    }

    // 显式拒绝 OrderPack 来源 (本接口只接受 free)
    if (doc.OrderPack || doc.resource === 'OrderPack') {
      throw ({ code: 400, message: "本接口仅用于手动添加 free 赠送课包, OrderPack 来源请走订单创建流程" });
    }

    // 自动注入
    doc.resource = 'free';
    doc.Account = student.Account;
    doc.Org = student.Org;
    doc.createdBy = payload.currentUser._id;
    doc.packName = doc.packName || '赠送课时';
    doc.status = doc.status || 'active';
    doc.activeDate = doc.activeDate || new Date();
    // expireDate: 优先用前端传入, 否则用 activeDate + 365 天兜底
    if (!doc.expireDate) {
      const fallback = new Date(doc.activeDate);
      fallback.setDate(fallback.getDate() + 365);
      doc.expireDate = fallback;
    }
    // remainingLesson: 允许少于 totalLesson (补发场景)
    if (doc.remainingLesson === undefined || doc.remainingLesson === null) {
      doc.remainingLesson = doc.totalLesson;
    }
    if (doc.remainingLesson > doc.totalLesson) {
      throw ({ code: 400, message: "remainingLesson 不能大于 totalLesson" });
    }

    const { item } = await DAO.add(StudentPackModel, doc, options);
    return { item };
  } catch (e) {
    console.error('StudentPackDao add error:', e);
    throw e;
  }
};

const edit = async (payload = {}, _id, doc, options) => {
  try {
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "您无权修改学生课包" });
    }
    if (!payload.isAdmin) {
      throw ({ code: 403, message: "只有超管才能修改学生课包" });
    }
    userPayloadChecker(payload);

    const targetStudentPack = await StudentPackModel.findById(_id);
    if (!targetStudentPack) {
      throw ({ code: 404, message: '学生课包不存在' });
    }
    // 超管也只能改本公司 (业务数据 Org 隔离, 与 OrderPack.edit 保持一致)
    if (targetStudentPack.Org.toString() !== payload.currentUser.Org.toString()) {
      throw ({ code: 403, message: "您无权修改其他校区的学生课包" });
    }

    // remainingLesson 业务校验
    if (doc.remainingLesson !== undefined && doc.remainingLesson > targetStudentPack.totalLesson) {
      throw ({ code: 400, message: "remainingLesson 不能大于 totalLesson" });
    }
    if (doc.remainingLesson !== undefined && doc.remainingLesson < 0) {
      throw ({ code: 400, message: "remainingLesson 不能为负" });
    }

    doc.updatedBy = payload.currentUser._id;
    targetStudentPack.set(doc);
    const { item } = await DAO.edit(targetStudentPack, options);

    return { item };
  } catch (e) {
    console.error('StudentPackDao update error:', e);
    throw e;
  }
};

/**
 * 内部 helper: 由 OrderPack.dao.add 在订单落库后调用
 * - 拷贝 OrderPack 字段作为快照
 * - 唯一索引防重复: 已存在则返回现有记录(不抛错)
 * - 接受 options.session 以支持事务
 */
const createFromOrderPack = async (orderPackDoc, payload, options = {}) => {
  try {
    // 防重复: 同一 OrderPack 只落地一次
    const existing = await StudentPackModel.findOne({ OrderPack: orderPackDoc._id });
    if (existing) {
      console.info(`StudentPackDao.createFromOrderPack: OrderPack ${orderPackDoc._id} 已存在 StudentPack ${existing._id}, 跳过创建`);
      return { item: existing, skipped: true };
    }

    const activeDate = new Date();
    let expireDate = null;
    if (orderPackDoc.validDays) {
      expireDate = new Date(activeDate);
      expireDate.setDate(expireDate.getDate() + Number(orderPackDoc.validDays));
    }

    const doc = {
      resource: 'OrderPack',
      OrderPack: orderPackDoc._id,
      Student: orderPackDoc.Student,
      Account: orderPackDoc.Account,
      Pack: orderPackDoc.Pack,
      packName: orderPackDoc.packName,
      totalLesson: orderPackDoc.totalLesson,
      remainingLesson: orderPackDoc.totalLesson,
      activeDate,
      expireDate,
      status: 'active',
      Org: orderPackDoc.Org,
      createdBy: payload?.currentUser?._id || orderPackDoc.createdBy,
    };

    const { item } = await DAO.add(StudentPackModel, doc, options);
    console.info(`StudentPackDao.createFromOrderPack: 已为 OrderPack ${orderPackDoc._id} 创建 StudentPack ${item._id}`);
    return { item, skipped: false };
  } catch (e) {
    // 唯一索引冲突: 并发场景下兜底, 不让 OrderPack 失败
    if (e && e.code === 11000) {
      console.warn(`StudentPackDao.createFromOrderPack: OrderPack ${orderPackDoc._id} 唯一索引冲突(并发), 已跳过`);
      const existing = await StudentPackModel.findOne({ OrderPack: orderPackDoc._id });
      return { item: existing, skipped: true };
    }
    console.error('StudentPackDao.createFromOrderPack error:', e);
    throw e;
  }
};

// StudentPack 不能被删除 remove 只需要在 把 status 修改为 refunded / exhausted
module.exports = {
  StudentPackDAO: {
    list,
    detail,
    add,
    edit,
    createFromOrderPack,
  },
  StudentPackModel, StudentPackDOC, StudentPackEnums,
};
