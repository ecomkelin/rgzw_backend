const { ObjectId } = require('mongoose').Types;

exports.isObj = (val) => val && typeof val === 'object' && !Array.isArray(val);


/**
 * 验证批量操作 ID 列表（限制数量+验证 ObjectId 合法性）
 * @param {Array} ids - 批量操作的 ID 数组
 * @returns {Object} { isValid: 布尔值, message: 错误信息, safeIds: 合法的 ID 数组 }
 */
exports.validateBatchIds = (ids, maxLimit = 100) => {
    // 1. 验证是否为数组
    if (!Array.isArray(ids)) {
        return {
            isValid: false,
            message: 'ID 列表必须是数组格式',
            safeIds: []
        };
    }

    // 2. 验证数量限制
    if (ids.length === 0) {
        return {
            isValid: false,
            message: 'ID 列表不能为空',
            safeIds: []
        };
    }

    if (ids.length > maxLimit) {
        return {
            isValid: false,
            message: `ID 列表数量不能超过 ${maxLimit}`,
            safeIds: []
        };
    }

    // 3. 验证 ObjectId 合法性
    const safeIds = ids.filter(id => ObjectId.isValid(id));
    if (safeIds.length !== ids.length) {
        return {
            isValid: false,
            message: 'ID 列表中包含非法的 ObjectId',
            safeIds: []
        };
    }

    // 4. 验证通过
    return {
        isValid: true,
        message: '验证通过',
        safeIds
    };
};