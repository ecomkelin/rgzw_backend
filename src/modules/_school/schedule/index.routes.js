const express = require('express');
const router = express.Router();
const CT = require('./controller');
const { authenticate } = require('@middlewares/auth');
const Validator = require('./middlewares/validator');
const Permission = require('./middlewares/permission');

// 1. 预览 / 生成 Lesson
router.post('/lessons/preview',  authenticate, Validator.courseRuleVD,  CT.preview);
router.post('/lessons/generate', authenticate, Permission.manager,      Validator.courseRuleVD,  CT.generate);

// 2. 四维度查询
router.post('/lessons/by-course/:courseId',   authenticate, Validator.entityRangeVD, CT.listBy('course'));
router.post('/lessons/by-room/:roomId',       authenticate, Validator.entityRangeVD, CT.listBy('room'));
router.post('/lessons/by-teacher/:teacherId', authenticate, Validator.entityRangeVD, CT.listBy('teacher'));
router.post('/lessons/by-student/:studentId', authenticate, Validator.entityRangeVD, CT.listBy('student'));

// 3. 单条编辑 / 取消 (manager only)
router.post('/lessons/edit/:id',   authenticate, Permission.manager, Validator.lessonEditVD, CT.editLesson);
router.post('/lessons/cancel/:id', authenticate, Permission.manager, CT.cancelLesson);

// 4. 汇总 / 冲突
router.post('/lessons/overview', authenticate, Validator.overviewVD,  CT.overview);
router.post('/conflicts/check',   authenticate, Validator.conflictVD,  CT.checkConflicts);

// 5. AI 解析
router.post('/ai/parse-slots',         authenticate, Validator.parseVD,   CT.parseSlots);
router.post('/ai/parse-slots/confirm', authenticate, Permission.manager, Validator.confirmVD, CT.confirmSlots);

module.exports = router;
