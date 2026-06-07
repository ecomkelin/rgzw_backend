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

/**
 * 自定义日期校验: 接受 Date 对象 / Date 字符串 (含 ISO 8601 完整格式)
 * 不能用 validator.isDate: v13.15 默认只识别 YYYY/MM/DD 这种短格式,
 * axios 序列化 Date 得到 `2026-06-01T00:00:00.000Z` 会被拒.
 * 用 Date.parse 作为兜底即可 (ISO / RFC2822 / YYYY-MM-DD 都能 parse).
 */
const isAcceptableDate = (v) => {
    if (v instanceof Date) return !isNaN(v.getTime());
    if (typeof v === 'string') return !isNaN(Date.parse(v));
    return false;
};

exports.commonBodyRules = {
    // 数组验证
    validateArray: (field, options = { maxLength: 10000, msg: '' }) =>
        body(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .isArray({ max: options.maxLength }).withMessage(options.msg || `${field} 必须是数组，且长度不能超过 ${options.maxLength}`),
    optionalArray: (field, options = { maxLength: 10000, msg: '' }) =>
        body(field)
            .optional()
            .isArray({ max: options.maxLength }).withMessage(options.msg || `${field} 必须是数组，且长度不能超过 ${options.maxLength}`),

    // ObjectId 验证
    validateObjectId: (field, msg = '') =>
        body(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .custom(value => ObjectId.isValid(value))
            .withMessage(msg || `${field} 必须是合法的 ObjectId`),

    optionalObjectId: (field, msg = '') =>
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

    validateDate: (field, msg = '') =>
        body(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .custom(isAcceptableDate).withMessage(msg || `${field} 必须是合法的日期`),
    optionalDate: (field, msg = '') =>
        body(field)
            // nullable: true  让 null 通过; checkFalsy: true 让 '' / undefined 也通过
            // 业务侧 (service.js) 本身就用 `if (from)` 短路, 真正不合法的日期不会影响过滤
            .optional({ nullable: true, checkFalsy: true })
            .custom(isAcceptableDate).withMessage(msg || `${field} 必须是合法的日期`),

    // 布尔值验证
    validateBoolean: (field, msg = '') =>
        body(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .isBoolean().withMessage(msg || `${field} 必须是布尔值(true/false)`)
            .toBoolean(),
    optionalBoolean: (field, msg = '') =>
        body(field)
            .optional()
            .isBoolean().withMessage(msg || `${field} 必须是布尔值(true/false)`)
            .toBoolean(),

    // 对象验证
    validateObject: (field, msg = '') =>
        body(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .isObject().withMessage(msg || `${field} 必须是对象格式`),
    optionalObject: (field, msg = '') =>
        body(field)
            .optional()
            .isObject().withMessage(msg || `${field} 必须是对象格式`),

    // 数字验证
    validateNumber: (field, msg = '', options = { min: 0, max: 99999999 }) =>
        body(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .isInt(options).withMessage(msg || `${field} 必须是大于等于 ${options.min} 的整数，且不能超过 ${options.max}`)
            .toInt(),

    optionalNumber: (field, msg = '', options = { min: 0, max: 99999999 }) =>
        body(field)
            .optional()
            .isInt(options).withMessage(msg || `${field} 必须是大于等于 ${options.min} 的整数，且不能超过 ${options.max}`)
            .toInt(),

    // 字符串验证
    validateString: (field, options = { maxLength: 10000, minLength: 0, msg: '' }) =>
        body(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .isString().withMessage(options.msg || `${field} 必须是字符串`)
            .trim()
            .isLength({ max: options.maxLength, min: options.minLength }).withMessage(`${field} 长度不能超过 ${options.maxLength} 个字符, 不能低于 ${options.minLength}`),
    subObjValString: (field, options = { maxLength: 10000, minLength: 0, msg: '' }) => {
        const objName = field.split('.')[0]
        return body(field)
            .if(body(objName).exists())
            .notEmpty().withMessage(`${field} 不能为空`)
            .isString().withMessage(options.msg || `${field} 必须是字符串`)
            .trim()
            .isLength({ max: options.maxLength, min: options.minLength }).withMessage(`${field} 长度不能超过 ${options.maxLength} 个字符, 不能低于 ${options.minLength}`)
    },
    optionalString: (field, options = { maxLength: 10000, minLength: 0, msg: '' }) =>
        body(field)
            .optional()
            .isString().withMessage(options.msg || `${field} 必须是字符串`)
            .trim()
            .isLength({ max: options.maxLength, min: options.minLength }).withMessage(`${field} 长度不能超过 ${options.maxLength} 个字符, 不能低于 ${options.minLength}`),

    validateEmail: (field, msg = '') =>
        body(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .isEmail().withMessage(msg || `${field} 必须是合法的邮箱地址`)
            .normalizeEmail(),

    optionalEmail: (field, msg = '') =>
        body(field)
            .optional()
            .isEmail().withMessage(msg || `${field} 必须是合法的邮箱地址`)
            .normalizeEmail(),

    // URL 验证
    validateUrl: (field, msg = '') =>
        body(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .isURL({ protocols: ['http', 'https'] })
            .withMessage(msg || `${field} 必须是合法的 HTTP/HTTPS 链接`),

    optionalUrl: (field, msg = '') =>
        body(field)
            .optional()
            .isURL({ protocols: ['http', 'https'] })
            .withMessage(msg || `${field} 必须是合法的 HTTP/HTTPS 链接`),
    validatePhone: (field, msg = '') =>
        body(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .isMobilePhone('any').withMessage(msg || `${field} 必须是合法的手机号`),

    optionalPhone: (field, msg = '') =>
        body(field)
            .optional()
            .isMobilePhone('any').withMessage(msg || `${field} 必须是合法的手机号`),

    validatePassword: (field, options = { minLength: 8, maxLength: 16, msg }) =>
        body(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .isString().withMessage(options.msg || `${field} 必须是字符串`)
            .isLength({ min: options.minLength, max: options.maxLength }).withMessage(`${field} 长度必须在 ${options.minLength} 到 ${options.maxLength} 个字符之间`),
    optionalPassword: (field, options = { minLength: 8, maxLength: 16, msg }) =>
        body(field)
            .optional()
            .isString().withMessage(options.msg || `${field} 必须是字符串`)
            .isLength({ min: options.minLength, max: options.maxLength }).withMessage(`${field} 长度必须在 ${options.minLength} 到 ${options.maxLength} 个字符之间`),
};

// ====================== 2. Param 参数通用规则（路径参数） ======================
exports.commonParamRules = {
    // ObjectId 验证（路径参数几乎都是必填，仅保留 validate 版本）
    validateObjectId: (field, msg = '') =>
        param(field)
            .notEmpty().withMessage(`${field} 不能为空`)
            .custom(value => ObjectId.isValid(value))
            .withMessage(msg || `${field} 必须是合法的 ObjectId`),
};

// ====================== 3. Query 参数通用规则（URL 查询参数） ======================
exports.commonQueryRules = {
    // ObjectId 验证（查询参数几乎都是可选，仅保留 optional 版本）
    optionalObjectId: (field, msg = '') =>
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
    optionalBoolean: (field, msg = '') =>
        query(field)
            .optional()
            .isBoolean().withMessage(msg || `${field} 必须是布尔值(true/false)`)
            .toBoolean(),

    // 数字验证（分页/排序等）
    optionalNumber: (field, msg = '', options = { min: 1, max: 99999999 }) =>
        query(field)
            .optional()
            .isInt(options).withMessage(msg || `${field} 必须是大于等于 ${options.min} 的整数，且不能超过 ${options.max}`)
            .toInt(),

    // 字符串验证（模糊查询等）
    optionalString: (field, options = { maxLength: 10000, minLength: 0, msg: '' }) =>
        query(field)
            .optional()
            .isString().withMessage(options.msg || `${field} 必须是字符串`)
            .trim()
            .isLength({ max: options.maxLength, min: options.minLength }).withMessage(`${field} 长度不能超过 ${options.maxLength} 个字符, 不能低于 ${options.minLength}`),
};




const maxPageSize = process.env.MAX_HANDLE_ITEM || 1000; // 设置默认值
// --------------------------
// 🔥 主 populate 数组
// --------------------------
const populateValidator = [
    body('options.populate')
        .optional()
        .isArray().withMessage('populate 必须是数组')
        .customSanitizer(val => Array.isArray(val) ? val : []),

    // --------------------------
    // 🔥 每一项的 path（必填 + 白名单）
    // --------------------------
    body('options.populate.*.path')
        .notEmpty().withMessage('populate.path 不能为空')
        .isString().withMessage('populate.path 必须是字符串')
        .matches(/^[a-z0-9_]+$/i).withMessage('path 格式非法'),

    // --------------------------
    // 🔥 select
    // --------------------------
    body('options.populate.*.select')
        .optional()
        .isString().withMessage('populate.select 必须是字符串')
        .matches(/^[a-z0-9_\s]+$/i).withMessage('select 格式非法'),

    // --------------------------
    // 🔥 match（过滤条件）
    // --------------------------
    body('options.populate.*.match')
        .optional()
        .isObject().withMessage('populate.match 必须是对象'),

    // --------------------------
    // 🔥 options（sort/limit/skip）
    // --------------------------
    body('options.populate.*.options')
        .optional()
        .isObject().withMessage('populate.options 必须是对象'),

    body('options.populate.*.options.sort')
        .optional()
        .isObject(),

    body('options.populate.*.options.limit')
        .optional()
        .isInt({ min: 1, max: 100 }),

    body('options.populate.*.options.skip')
        .optional()
        .isInt({ min: 0 }),

    // --------------------------
    // 🔥 嵌套 populate（递归第二层）
    // --------------------------
    body('options.populate.*.populate')
        .optional()
        .isArray().withMessage('嵌套 populate 必须是数组'),

    body('options.populate.*.populate.*.path')
        .optional()
        .isString()
        .matches(/^[a-z0-9_]+$/i)
        .custom((path) => {
            const allowedPaths = ['leaderId', 'deptId', 'parentId']; // 二级嵌套白名单
            if (!allowedPaths.includes(path)) {
                throw ({ code: 500, message: `嵌套填充不允许：${path}` });
            }
            return true;
        }),

    body('options.populate.*.populate.*.select')
        .optional()
        .isString()
];
exports.listOptionsValidator = [
    body('options')
        .optional()
        .isObject()
        .withMessage('options 必须是对象格式'),

    body('options.limit')
        .optional()
        .isInt({ min: 1, max: maxPageSize })
        .withMessage('options.limit 必须是大于等于 1 的整数')
        .toInt(),

    body('options.skip')
        .optional()
        .isInt({ min: 0 })
        .withMessage(`options.skip 必须是 大于等于 0 的整数`)
        .toInt(),

    body('options.sort')
        .optional()
        .isObject()
        .withMessage('options.sort 必须是对象格式')
        .custom(sort => {
            for (const [key, value] of Object.entries(sort)) {
                if (![1, -1].includes(value)) {
                    throw ({ code: 500, message: `sort.${key} 的值必须是 1（升序）或 -1（降序）` });
                }
            }
            return true;
        }),
    ...populateValidator
]

exports.detailOptionsValidator = [
    body('options')
        .optional()
        .isObject()
        .withMessage('options 必须是对象格式'),
    ...populateValidator
]