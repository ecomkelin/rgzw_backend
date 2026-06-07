const { validatorErrorHandle, commonBodyRules, commonParamRules, listOptionsValidator, detailOptionsValidator } = require('@utils/validatorHandle');
const { body } = require('express-validator');

// 通用: 时间范围 + 可选 teacher/room/student + 可选 excludeLessonId
exports.entityRangeVD = [
    commonParamRules.validateObjectId('courseId'),
    commonParamRules.validateObjectId('roomId'),
    commonParamRules.validateObjectId('teacherId'),
    commonParamRules.validateObjectId('studentId'),
    commonBodyRules.optionalDate('from'),
    commonBodyRules.optionalDate('to'),
    ...listOptionsValidator,
    validatorErrorHandle
];

// 预览 / 生成课程的规则
exports.courseRuleVD = [
    commonBodyRules.validateObjectId('courseId'),
    commonBodyRules.optionalDate('from'),
    commonBodyRules.optionalDate('to'),
    commonBodyRules.optionalBoolean('replace'),
    validatorErrorHandle
];

exports.lessonEditVD = [
    commonParamRules.validateObjectId('id'),
    commonBodyRules.optionalDate('plannedDate'),
    commonBodyRules.optionalDate('plannedEndDate'),
    commonBodyRules.optionalObjectId('teacher'),
    commonBodyRules.optionalObjectId('classroom'),
    commonBodyRules.optionalString('description', { minLength: 0, maxLength: 500 }),
    commonBodyRules.optionalString('summary',     { minLength: 0, maxLength: 1000 }),
    commonBodyRules.optionalString('name',        { minLength: 0, maxLength: 100 }),
    commonBodyRules.optionalEnum('status', ['scheduled', 'ongoing', 'completed', 'cancelled']),
    commonBodyRules.optionalEnum('teacherAttendance', ['present', 'absent', 'late', 'leave']),
    validatorErrorHandle
];

// 冲突检测
exports.conflictVD = [
    commonBodyRules.validateDate('start'),
    commonBodyRules.validateDate('end'),
    commonBodyRules.optionalObjectId('teacher'),
    commonBodyRules.optionalObjectId('room'),
    commonBodyRules.optionalObjectId('student'),
    commonBodyRules.optionalObjectId('excludeLessonId'),
    validatorErrorHandle
];

// 汇总查询
exports.overviewVD = [
    commonBodyRules.optionalDate('from'),
    commonBodyRules.optionalDate('to'),
    commonBodyRules.optionalObjectId('Org'),
    validatorErrorHandle
];

// AI 解析
exports.parseVD = [
    commonBodyRules.validateString('text', { minLength: 1, maxLength: 500 }),
    commonBodyRules.optionalEnum('context', ['student', 'room', 'teacher']),
    commonBodyRules.optionalString('anchorDate'),
    validatorErrorHandle
];

// AI 解析确认写入
exports.confirmVD = [
    commonBodyRules.validateEnum('target', ['student', 'room', 'teacher']),
    commonBodyRules.validateObjectId('targetId'),
    commonBodyRules.validateArray('slots'),
    commonBodyRules.optionalEnum('mode', ['append', 'replace']),
    body('slots.*').custom((value) => {
        const { validateTimeBlock } = require('@utils/timeBlock');
        if (!validateTimeBlock(value)) {
            throw new Error('slots 单条不合法');
        }
        return true;
    }),
    validatorErrorHandle
];
