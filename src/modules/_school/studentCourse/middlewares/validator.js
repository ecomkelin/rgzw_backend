const { body } = require('express-validator');
const {
  validatorErrorHandle,
  commonBodyRules,
  commonParamRules,
  listOptionsValidator,
  detailOptionsValidator,
} = require('@utils/validatorHandle');
const { StudentCourseEnums } = require('@models/school/student/StudentCourse.dao');

/**
 * add 校验 (学生确认上课后, 管理员填写)
 * - 必填: Student / Course
 * - 可选: StudentPack / StudentCourseDate / status / remark
 * - 显式拒绝不可由前端设置的字段: Account / Org / nameCourse / createdBy / updatedBy
 */
exports.addVD = [
  // 必填关联
  commonBodyRules.validateObjectId('Student'),
  commonBodyRules.validateObjectId('Course'),

  // 可选关联
  commonBodyRules.optionalObjectId('StudentPack'),

  // 可选业务字段
  commonBodyRules.optionalDate('StudentCourseDate'),
  commonBodyRules.optionalEnum('status', StudentCourseEnums.statusEnums),
  commonBodyRules.optionalString('remark', { minLength: 0, maxLength: 500 }),

  // 禁字段 (由 service / DAO 强制注入)
  body('Account').custom(value => { if (value !== undefined) throw new Error('Account 不可设置, 由后端从 Student 推导'); return true; }),
  body('Org').custom(value => { if (value !== undefined) throw new Error('Org 不可设置, 由后端从 currentUser.Org 注入'); return true; }),
  body('nameCourse').custom(value => { if (value !== undefined) throw new Error('nameCourse 不可设置, 由后端从 Course.name 冗余'); return true; }),
  body('createdBy').custom(value => { if (value !== undefined) throw new Error('createdBy 不可设置, 由后端注入'); return true; }),
  body('updatedBy').custom(value => { if (value !== undefined) throw new Error('updatedBy 不可设置, 由后端注入'); return true; }),

  validatorErrorHandle
];

/**
 * edit 校验
 * - 路径 id 必填且为 ObjectId
 * - 可改字段: StudentPack / StudentCourseDate / status / remark
 * - 不可改字段: Student / Account / Course / Org / nameCourse / createdBy
 * - 业务约束: StudentCourse.add 时 StudentPack 可空, 后续 edit 可绑定/更换(传 null 可解绑)
 */
exports.editVD = [
  commonParamRules.validateObjectId('id'),

  commonBodyRules.optionalObjectId('StudentPack'),
  commonBodyRules.optionalDate('StudentCourseDate'),
  commonBodyRules.optionalEnum('status', StudentCourseEnums.statusEnums),
  commonBodyRules.optionalString('remark', { minLength: 0, maxLength: 500 }),

  // 禁字段
  body('Student').custom(value => { if (value !== undefined) throw new Error('Student 不可修改'); return true; }),
  body('Account').custom(value => { if (value !== undefined) throw new Error('Account 不可修改'); return true; }),
  body('Course').custom(value => { if (value !== undefined) throw new Error('Course 不可修改'); return true; }),
  body('Org').custom(value => { if (value !== undefined) throw new Error('Org 不可修改'); return true; }),
  body('nameCourse').custom(value => { if (value !== undefined) throw new Error('nameCourse 不可修改'); return true; }),
  body('createdBy').custom(value => { if (value !== undefined) throw new Error('createdBy 不可修改'); return true; }),
  body('updatedBy').custom(value => { if (value !== undefined) throw new Error('updatedBy 由后端自动注入, 不接受前端传值'); return true; }),

  validatorErrorHandle
];

/**
 * list 校验
 * 业务上常见过滤: Student / Course / Account / status / StudentPack
 */
exports.listVD = [
  commonBodyRules.optionalObject('filter'),
  commonBodyRules.optionalObjectId('filter.Student'),
  commonBodyRules.optionalObjectId('filter.Course'),
  commonBodyRules.optionalObjectId('filter.Account'),
  commonBodyRules.optionalObjectId('filter.StudentPack'),
  commonBodyRules.optionalObjectId('filter.Org'),
  commonBodyRules.optionalEnum('filter.status', StudentCourseEnums.statusEnums),

  ...listOptionsValidator,
  validatorErrorHandle
];

/**
 * detail 校验
 */
exports.detailVD = [
  commonParamRules.validateObjectId('id'),
  ...detailOptionsValidator,
  validatorErrorHandle
];
