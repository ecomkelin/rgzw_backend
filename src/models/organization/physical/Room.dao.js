const DAO = require('@models/DAO');
const { RoomModel, RoomEnums, RoomDOC } = require('./Room.model');
const { CourseModel } = require('../../school/course/Course.model');
const { userPayloadChecker } = require('@utils/payloadChecker');

const list = async (payload = {}, filter, options) => {
  try {
    userPayloadChecker(payload);
    // 验证权限
    if (!payload.isAdmin) {
      if (payload.currentUser.roleTemp !== 'manager') {
        throw ({ code: 403, message: "您无权查看教室列表" });
      }
      filter.Org = payload.currentUser.Org;
    }

    const { items, total } = await DAO.list(RoomModel, filter, options);
    return { items, total };
  } catch (e) {
    console.error('RoomDao list error:', e);
    throw e;
  }
};

const detail = async (payload = {}, _id, options) => {
  try {
    userPayloadChecker(payload);

    const { item } = await DAO.detail(RoomModel, _id, options);

    if (!item) {
      throw ({ code: 404, message: "此 教室 数据已不存在" });
    }

    // 验证权限
    if (!payload.isAdmin) {
      if (item.Org.toString() !== payload.currentUser.Org.toString()) {
        throw ({ code: 403, message: "您无权查看此教室" })
      }
    }

    return { item };
  } catch (e) {
    console.error('RoomDao detail error:', e);
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
    userPayloadChecker(payload);
    // 只有管理员可以创建教室
    if (!payload.isAdmin) {
      if (payload.currentUser.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有管理员才能创建教室" });
      }
    }
    doc.Org = payload.currentUser.Org;  // 普通用户只能创建属于自己的机构的教室

    doc.createdBy = payload.currentUser._id;

    const { item } = await DAO.add(RoomModel, doc, options);
    return { item };
  } catch (e) {
    console.error('RoomDao create error:', e);
    throw e;
  }
};

const edit = async (payload = {}, _id, doc, options) => {
  try {
    userPayloadChecker(payload);
    // 验证目标教室是否存在
    const targetRoom = await RoomModel.findById(_id);
    if (!targetRoom) {
      throw ({ code: 404, message: '教室不存在' });
    }

    if (!payload.isAdmin) {
      if (payload.currentUser.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有管理员才能修改教室" });
      }
      if (targetRoom.Org.toString() !== payload.currentUser.Org.toString()) {
        throw ({ code: 403, message: "您无权修改此教室" });
      }
    }

    doc.updatedBy = payload.currentUser._id;
    targetRoom.set(doc);
    const { item } = await DAO.edit(targetRoom, options);

    return { item };

  } catch (e) {
    console.error('RoomDao update error:', e);
    throw e;
  }
};

// const remove = async (payload = {}, _id, options) => {
//   try {
//     userPayloadChecker(payload);
//     // 验证目标教室是否存在
//     const targetRoom = await RoomModel.findById(_id);
//     if (!targetRoom) {
//       throw ({ code: 404, message: '教室不存在' });
//     }

//     if (!payload.isAdmin) {
//       if (payload.currentUser.roleTemp !== 'manager') {
//         throw ({ code: 403, message: "只有管理员才能删除教室" });
//       }
//       if (targetRoom.Org.toString() !== payload.currentUser.Org.toString()) {
//         throw ({ code: 403, message: "您无权删除此教室" });
//       }
//     }

//     const existRelatedCourse = await CourseModel.countDocuments({ Room: _id, isActive: true });
//     if (existRelatedCourse > 0) {
//       throw ({ code: 400, message: "无法删除教室，请先移除相关课程的教室关联" });
//     }

//     const { item } = await DAO.remove(RoomModel, _id);
//     return { item };
//   } catch (e) {
//     console.error('RoomDao delete error:', e);
//     throw e;
//   }
// }

// Room 不能被删除 remove 只需要在 把 isActive 修改为 false

module.exports = {
  RoomDAO: {
    list,
    detail,
    add,
    edit,
    // remove
  },
  RoomModel, RoomDOC, RoomEnums,
}