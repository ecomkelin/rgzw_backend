const LabelMD = require('@models/global/Label.model');

/**
 * 恢复被软删除的标签
 */
const restoreDeletedLabel = async (_id, payload) => {
  try {
    const updateQuery = {
      _id,
      Org: payload.currentUser?.Org,
      isActive: false // 确保标签确实是被标记为删除的
    };

    const updateData = {
      isActive: true,
      updatedBy: payload._id,
      deletedAt: null // 清除删除时间
    };

    const updatedItem = await LabelMD.findOneAndUpdate(updateQuery, updateData, { new: true })
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');

    return {
      item: updatedItem,
      restored: !!updatedItem,
      message: updatedItem ? '标签已恢复' : '标签不存在、不属于您的组织或未被删除'
    };
  } catch (error) {
    console.error('Label restore error:', error.message);
    throw error;
  }
};

/**
 * 永久删除已被软删除的标签
 */
const permanentDeleteLabel = async (_id, payload) => {
  try {
    const deleteQuery = {
      _id,
      Org: payload.currentUser?.Org,
      isActive: false // 确保标签确实已被标记为删除
    };

    const result = await LabelMD.deleteOne(deleteQuery);

    return {
      deleted: result.deletedCount > 0,
      message: result.deletedCount > 0 ? '标签已永久删除' : '标签不存在、不属于您的组织或尚未被软删除'
    };
  } catch (error) {
    console.error('Label permanent delete error:', error.message);
    throw error;
  }
};

/**
 * 获取已软删除的标签列表
 */
const getDeletedLabels = async (payload, options = {}) => {
  try {
    const query = {
      Org: payload.currentUser?.Org,
      isActive: false // 只获取已删除的标签
    };

    // 应用其他过滤选项
    if (options.mould) {
      query.mould = options.mould;
    }

    const { pageSize = 10, skip = 0, sort = { createdAt: -1 } } = require('@utils/formatOptions')(options);

    const items = await LabelMD
      .find(query)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email')
      .sort(sort)
      .limit(pageSize)
      .skip(skip);

    const totalCount = await LabelMD.countDocuments(query);

    return {
      items,
      pagination: {
        currentPage: Math.floor(skip / pageSize) + 1,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    };
  } catch (error) {
    console.error('Get deleted labels error:', error.message);
    throw error;
  }
};

module.exports = {
  restoreDeletedLabel,
  permanentDeleteLabel,
  getDeletedLabels
};