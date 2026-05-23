/** 基于范围，或者多条查询 还没有写通用的， 后续再加上 */

// 全局验证结果处理中间件
const { validationResult, matchedData } = require('express-validator');

const { body, query, param } = require('express-validator');
const { ObjectId } = require('mongoose').Types;

exports.validatorErrorHandle = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // 添加验证错误日志
        console.error('@utils/validatorHandle validatorErrorHandle', {
            url: req.url,
            method: req.method,
            errors: errors.array(),
            timestamp: new Date().toISOString()
        });

        return res.status(400).json({
            code: 400,
            message: errors.array()[0].msg,
            errors: errors.array()
        });
    }
    req.validData = matchedData(req);
    next();
};



// ====================== 1. Body 参数通用规则（请求体） ======================
exports.commonBodyRules = {
    // 数组验证
    validateArray: (field, options = { maxLength: 10000, msg }) =>
        body(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .isArray({ max: options.maxLength }).withMessage(options.msg || `${field} 必须是数组，且长度不能超过 ${options.maxLength}`),

    // ObjectId 验证
    validateObjectId: (field, msg) =>
        body(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .custom(value => ObjectId.isValid(value))
            .withMessage(msg || `${field} 必须是合法的 ObjectId`),

    optionalObjectId: (field, msg) =>
        body(field)
            .optional()
            .custom(value => {
                if (!value) return true;
                return ObjectId.isValid(value);
            })
            .withMessage(msg || `${field} 必须是合法的 ObjectId`),

    // 枚举值验证
    validateEnum: (field, enums) =>
        body(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .isIn(enums)
            .withMessage(`${field} 只能是 ${enums.join('/')} 中的一种`),

    optionalEnum: (field, enums) =>
        body(field)
            .optional()
            .isIn(enums)
            .withMessage(`${field} 只能是 ${enums.join('/')} 中的一种`),

    // 布尔值验证
    validateBoolean: (field, msg) =>
        body(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .isBoolean().withMessage(msg || `${field} 必须是布尔值(true/false)`)
            .toBoolean(),

    optionalBoolean: (field, msg) =>
        body(field)
            .optional()
            .isBoolean().withMessage(msg || `${field} 必须是布尔值(true/false)`)
            .toBoolean(),

    // 数字验证
    validateNumber: (field, msg, options = { min: 0 }) =>
        body(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .isInt(options).withMessage(msg || `${field} 必须是大于等于 ${options.min} 的整数`)
            .toInt(),

    optionalNumber: (field, msg, options = { min: 0 }) =>
        body(field)
            .optional()
            .isInt(options).withMessage(msg || `${field} 必须是大于等于 ${options.min} 的整数`)
            .toInt(),

    // 字符串验证
    validateString: (field, options = { maxLength: 10000, minLength: 0, msg }) =>
        body(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .isString().withMessage(options.msg || `${field} 必须是字符串`)
            .trim()
            .isLength({ max: options.maxLength, min: options.minLength }).withMessage(`${field} 长度不能超过 ${options.maxLength} 个字符, 不能低于 ${options.minLength}`),

    optionalString: (field, options = { maxLength: 10000, minLength: 0, msg }) =>
        body(field)
            .optional()
            .isString().withMessage(options.msg || `${field} 必须是字符串`)
            .trim()
            .isLength({ max: options.maxLength, min: options.minLength }).withMessage(`${field} 长度不能超过 ${options.maxLength} 个字符, 不能低于 ${options.minLength}`),

    // URL 验证
    optionalUrl: (field, msg) =>
        body(field)
            .optional()
            .isURL({ protocols: ['http', 'https'] })
            .withMessage(msg || `${field} 必须是合法的 HTTP/HTTPS 链接`)
};

// ====================== 2. Param 参数通用规则（路径参数） ======================
exports.commonParamRules = {
    // 数组验证（路径参数不常见，仅保留 validate 版本）
    validateArray: (field, options = { maxLength: 10000, msg }) =>
        param(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .isArray({ max: options.maxLength }).withMessage(options.msg || `${field} 必须是数组，且长度不能超过 ${options.maxLength}`),
    // ObjectId 验证（路径参数几乎都是必填，仅保留 validate 版本）
    validateObjectId: (field, msg) =>
        param(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .custom(value => ObjectId.isValid(value))
            .withMessage(msg || `${field} 必须是合法的 ObjectId`),

    // 字符串验证（如路径中的非 ObjectId 字符串参数）
    validateString: (field, options = { maxLength: 10000, minLength: 0, msg }) =>
        param(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .isString().withMessage(options.msg || `${field} 必须是字符串`)
            .trim()
            .isLength({ max: options.maxLength, min: options.minLength }).withMessage(`${field} 长度不能超过 ${options.maxLength} 个字符, 不能低于 ${options.minLength}`),

    // 数字验证（如路径中的 ID 数字）
    validateNumber: (field, msg, options = { min: 0 }) =>
        param(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .isInt(options).withMessage(msg || `${field} 必须是大于等于 ${options.min} 的整数`)
            .toInt()
};

// ====================== 3. Query 参数通用规则（URL 查询参数） ======================
exports.commonQueryRules = {
    // ObjectId 验证（查询参数几乎都是可选，仅保留 optional 版本）
    optionalObjectId: (field, msg) =>
        query(field)
            .optional()
            .custom(value => {
                if (!value) return true;
                return ObjectId.isValid(value);
            })
            .withMessage(msg || `${field} 必须是合法的 ObjectId`),

    // 枚举值验证
    optionalEnum: (field, enums) =>
        query(field)
            .optional()
            .isIn(enums)
            .withMessage(`${field} 只能是 ${enums.join('/')} 中的一种`),

    // 布尔值验证
    optionalBoolean: (field, msg) =>
        query(field)
            .optional()
            .isBoolean().withMessage(msg || `${field} 必须是布尔值(true/false)`)
            .toBoolean(),

    // 数字验证（分页/排序等）
    optionalNumber: (field, msg, options = { min: 1 }) =>
        query(field)
            .optional()
            .isInt(options).withMessage(msg || `${field} 必须是大于等于 ${options.min} 的整数`)
            .toInt(),

    // 字符串验证（模糊查询等）
    optionalString: (field, options = { maxLength: 10000, minLength: 0, msg }) =>
        query(field)
            .optional()
            .isString().withMessage(options.msg || `${field} 必须是字符串`)
            .trim()
            .isLength({ max: options.maxLength, min: options.minLength }).withMessage(`${field} 长度不能超过 ${options.maxLength} 个字符, 不能低于 ${options.minLength}`),
};


const maxPageSize = process.env.MAX_HANDLE_ITEM || 1000; // 设置默认值
exports.validatorOptions = [
    // 1. options 可选传，传了则必须是对象
    body('options')
        .optional()
        .isObject()
        .withMessage('options 必须是对象格式'),

    // 2. options.page 可选传，传了则必须是≥1的整数
    body('options.page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('options.page 必须是大于等于 1 的整数')
        .toInt(),

    // 3. options.pageSize 可选传，传了则必须在 [1, maxPageSize] 范围内
    body('options.pageSize')
        .optional()
        .isInt({ min: 1, max: maxPageSize })
        .withMessage(`options.pageSize 必须是 1-${maxPageSize} 之间的整数`)
        .toInt(),

    // 4. options.sortObj 可选传，传了则必须是对象，且值为±1、键为合法字段
    body('options.sortObj')
        .optional()
        .isObject()
        .withMessage('options.sortObj 必须是对象格式')
        .custom(sortObj => {
            // 遍历 sortObj 验证每个键值对
            for (const [key, value] of Object.entries(sortObj)) {
                // 验证排序值只能是 1/-1
                if (![1, -1].includes(value)) {
                    throw new Error(`sortObj.${key} 的值必须是 1（升序）或 -1（降序）`);
                }
            }
            return true;
        })
];