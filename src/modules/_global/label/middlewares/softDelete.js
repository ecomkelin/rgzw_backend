const LabelMD = require('@models/global/Label.model');
const ApiResponse = require('../../../../utils/response');

/**
 * 可选的软删除中间件 - 根据请求参数决定是硬删除还是软删除
 */
const softDeleteMiddleware = (req, res, next) => {
  // 检查请求头或查询参数是否要求软删除
  const softDelete = req.query.softDelete === 'true' || req.body.softDelete === true;

  if (softDelete) {
    // 使用软删除逻辑
    req.useSoftDelete = true;
  } else {
    // 使用硬删除逻辑
    req.useSoftDelete = false;
  }

  next();
};

/**
 * 软删除实现函数
 */
const performSoftDelete = async (_id, payload) => {
  try {
    const updateQuery = {
      _id,
      Org: payload.Org_id
    };
    const updateData = {
      isActive: false,
      updatedBy: payload._id,
      deletedAt: new Date()
    };
    const updatedItem = await LabelMD.findOneAndUpdate(updateQuery, updateData, { new: true })
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');

    return {
      item: updatedItem,
      deleted: !!updatedItem,
      message: updatedItem ? '标签已标记为删除' : '标签不存在或无权删除'
    };
  } catch (error) {
    console.error('Label soft delete error:', error.message);
    throw error;
  }
};

/**
 * 软删除批量实现函数
 */
const performSoftDeleteMany = async (query, payload) => {
  try {
    const { ids } = query;
    if (!Array.isArray(ids) || ids.length < 1) {
      throw new Error("LabelSV softDeleteIds error: ids必须是数组 并且不能为空");
    }
    if (ids.length > 100) {
      throw new Error("LabelSV softDeleteIds error: 单次批量删除不能超过100条记录");
    }

    const updateQuery = {
      _id: { $in: ids },
      Org: payload.Org_id
    };

    const updateData = {
      isActive: false,
      updatedBy: payload._id,
      deletedAt: new Date()
    };

    const result = await LabelMD.updateMany(updateQuery, updateData);

    return {
      updatedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
      message: `成功软删除了 ${result.modifiedCount} 个标签`
    };
  } catch (error) {
    console.error('Label soft delete many error:', error.message);
    throw error;
  }
};

module.exports = {
  softDeleteMiddleware,
  performSoftDelete,
  performSoftDeleteMany
};