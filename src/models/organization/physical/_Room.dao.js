const DAO = require('@models/DAO');
const { RoomModel, RoomEnums, RoomDOC } = require('./Room.model');

const list = async (payload = {}, filter, options) => {
  try {
    // 验证权限
    if (payload.accountType === 'Student') {
      throw ({ code: 403, message: "学生无权查看教室列表" });
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (payload.currentUser?.roleTemp !== 'manager') {
          throw ({ code: 403, message: "您无权查看教室列表" });
        }
        filter.Org = payload.currentUser.Org;
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
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
    const { item } = await DAO.detail(RoomModel, _id, options);

    if (!item) {
      throw ({ code: 404, message: "此 教室 数据已不存在" });
    }

    // 验证权限
    if (payload.accountType === 'Student') {
      throw ({ code: 403, message: "学生无权查看教室详情" });
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (item.Org.toString() !== payload.currentUser?.Org.toString()) {
          throw ({ code: 403, message: "您无权查看此教室" })
        }
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" })
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
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "您无权添加教室" });
    }

    // 只有管理员可以创建教室
    if (!payload.isAdmin) {
      if (payload.currentUser?.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有管理员才能创建教室" });
      }
    }

    doc.Org = payload.currentUser.Org;
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
    // 验证目标教室是否存在
    const targetRoom = await RoomModel.findById(_id);
    if (!targetRoom) {
      throw ({ code: 404, message: '教室不存在' });
    }

    // 验证权限
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "您无权修改教室" });
    }

    if (!payload.isAdmin) {
      if (payload.currentUser?.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有管理员才能修改教室" });
      }
      if (targetRoom.Org.toString() !== payload.currentUser?.Org.toString()) {
        throw ({ code: 403, message: "您无权修改此教室" });
      }
    }

    targetRoom.set(doc);
    const { item } = await DAO.edit(targetRoom, options);

    return { item };

  } catch (e) {
    console.error('RoomDao update error:', e);
    throw e;
  }
};

// Room 不能被删除 remove 只需要在 把 isActive 修改为 false

module.exports = {
  RoomDAO: {
    list,
    detail,
    add,
    edit,
  },
  RoomModel, RoomDOC, RoomEnums,
}