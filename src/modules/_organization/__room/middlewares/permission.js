const { RoomDAO } = require('@models/organization/physical/_Room.dao');

// 检查读取权限
const readPermission = async (req, res, next) => {
  try {
    const payload = req.payload;

    // 检查是否已认证
    if (!payload) {
      return res.status(401).json({ code: 401, message: '未认证' });
    }

    // 学生不能查看教室信息
    if (payload.accountType === 'Student') {
      return res.status(403).json({ code: 403, message: '学生无权查看教室信息' });
    }

    // 非管理员需要特殊权限才能查看
    if (!payload.isAdmin) {
      if (!payload.currentUser || payload.currentUser.roleTemp !== 'manager') {
        return res.status(403).json({ code: 403, message: '您无权查看教室信息' });
      }
    }

    next();
  } catch (error) {
    console.error('readPermission error:', error);
    return res.status(500).json({ code: 500, message: '权限验证失败' });
  }
};

// 检查创建权限
const createPermission = async (req, res, next) => {
  try {
    const payload = req.payload;

    // 检查是否已认证
    if (!payload) {
      return res.status(401).json({ code: 401, message: '未认证' });
    }

    // 学生不能创建教室
    if (payload.accountType === 'Student') {
      return res.status(403).json({ code: 403, message: '学生无权创建教室' });
    }

    // 非管理员不能创建教室
    if (!payload.isAdmin) {
      if (!payload.currentUser || payload.currentUser.roleTemp !== 'manager') {
        return res.status(403).json({ code: 403, message: '只有管理员才能创建教室' });
      }
    }

    next();
  } catch (error) {
    console.error('createPermission error:', error);
    return res.status(500).json({ code: 500, message: '权限验证失败' });
  }
};

// 检查编辑权限
const editPermission = async (req, res, next) => {
  try {
    const payload = req.payload;
    const roomId = req.params.id;

    // 检查是否已认证
    if (!payload) {
      return res.status(401).json({ code: 401, message: '未认证' });
    }

    // 学生不能编辑教室
    if (payload.accountType === 'Student') {
      return res.status(403).json({ code: 403, message: '学生无权编辑教室' });
    }

    // 非管理员权限检查
    if (!payload.isAdmin) {
      if (!payload.currentUser || payload.currentUser.roleTemp !== 'manager') {
        return res.status(403).json({ code: 403, message: '只有管理员才能编辑教室' });
      }
    }

    // 如果是管理员但不是超级管理员，检查教室是否属于当前机构
    if (!payload.isAdmin && payload.currentUser) {
      const room = await RoomDAO.detail(payload, roomId, {});
      if (room && room.item && room.item.Org) {
        if (room.item.Org.toString() !== payload.currentUser.Org.toString()) {
          return res.status(403).json({ code: 403, message: '您无权编辑此教室' });
        }
      }
    }

    next();
  } catch (error) {
    console.error('editPermission error:', error);
    return res.status(500).json({ code: 500, message: '权限验证失败' });
  }
};

// 检查管理权限（最高权限）
const managePermission = async (req, res, next) => {
  try {
    const payload = req.payload;

    // 检查是否已认证
    if (!payload) {
      return res.status(401).json({ code: 401, message: '未认证' });
    }

    // 学生不能管理教室
    if (payload.accountType === 'Student') {
      return res.status(403).json({ code: 403, message: '学生无权管理教室' });
    }

    // 只有管理员才能进行管理操作
    if (!payload.isAdmin || !payload.isSuperAdmin) {
      return res.status(403).json({ code: 403, message: '只有超级管理员才能进行此操作' });
    }

    next();
  } catch (error) {
    console.error('managePermission error:', error);
    return res.status(500).json({ code: 500, message: '权限验证失败' });
  }
};

module.exports = {
  readPermission,
  createPermission,
  editPermission,
  managePermission
};