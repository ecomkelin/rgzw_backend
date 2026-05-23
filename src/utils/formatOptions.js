/**
 * 通用查询工具：抽离分页、排序、批量操作限制等逻辑
 * 适用所有 Mongoose 模型的列表/批量操作接口
 */
const { ObjectId } = require('mongoose').Types;

// 1. 分页参数默认值（统一配置，便于全局修改）
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 60;

// 2. 批量操作数量限制（防止一次性查找/删除/更新太多数据）
const MAX_HANDLE_ITEM = process.env.MAX_HANDLE_ITEM;

// 3. 排序默认值（统一配置）
const DEFAULT_SORT_FIELDS = ['sort', 'updateAt']; // 默认排序字段
const DEFAULT_SORT_ORDER = -1; // 默认倒叙

/**
 * 抽离并格式化分页参数
 * @param {Object} options - req.query.options
 * @returns {Object} { page, pageSize, skip }
 */
exports.formatPagination = (options) => {
    // 格式化页码（转数字，小于1则取默认值）
    const page = parseInt(options.page) || DEFAULT_PAGE;
    const safePage = page < 1 ? DEFAULT_PAGE : page;

    // 格式化每页条数（转数字，超出范围则取默认/最大值）
    const pageSize = parseInt(options.pageSize) || DEFAULT_PAGE_SIZE;
    let safePageSize = pageSize < 1 ? DEFAULT_PAGE_SIZE : pageSize;
    safePageSize = safePageSize > MAX_HANDLE_ITEM ? MAX_HANDLE_ITEM : safePageSize;

    // 计算跳过条数（用于 Mongoose 的 skip()）
    const skip = (safePage - 1) * safePageSize;

    return {
        page: safePage,
        pageSize: safePageSize,
        skip
    };
};

/**
 * 抽离并格式化排序参数
 * @param {Object} options - req.query.options
 */
exports.formatSort = (options) => {
    try {
        const { sort = {} } = options;
        for (const i of DEFAULT_SORT_FIELDS) {
            if (i in sort) continue;
            sort[i] = DEFAULT_SORT_ORDER
        }
        return sort;
    } catch (error) {
        console.error("src/utils/formatOptions.js formatSort() 您传递的sort必须是对象", error)
        throw new Error("formatOptions.js formatSort() 您传递的sort必须是对象")
    }
};

/** 统一处理 分页和排序 */
exports.formatOptions = (options = {}) => {
    const pageConfig = this.formatPagination(options);
    const sort = this.formatSort(options);
    return { ...pageConfig, sort };
}