const ScheduleSV = require('./service');
const ApiResponse = require('@utils/response');
const { ObjectId } = require('mongoose').Types;

class ScheduleCT {
    preview = async (req, res) => {
        try {
            const { courseId, from, to } = req.validData || {};
            const data = await ScheduleSV.preview(req.payload, { courseId, from, to });
            return res.status(200).json(ApiResponse.success({ data }));
        } catch (e) {
            console.error('ScheduleCT preview error:', e);
            return res.status(e.code || 500).json(ApiResponse.error(e));
        }
    };

    generate = async (req, res) => {
        try {
            const { courseId, from, to, replace } = req.validData || {};
            const data = await ScheduleSV.generate(req.payload, { courseId, from, to, replace });
            return res.status(200).json(ApiResponse.success({ data }));
        } catch (e) {
            console.error('ScheduleCT generate error:', e);
            return res.status(e.code || 500).json(ApiResponse.error(e));
        }
    };

    // 4 维度统一入口
    listBy = (entity) => async (req, res) => {
        try {
            // 路径 :id 走 param 校验, 但 :courseId/:roomId/:teacherId/:studentId 也都是 param
            const entityId = req.params.courseId || req.params.roomId || req.params.teacherId || req.params.studentId;
            if (!entityId || !ObjectId.isValid(entityId)) {
                return res.status(400).json(ApiResponse.error({ code: 400, message: `${entity}Id 必须是合法的 ObjectId` }));
            }
            const { from, to, options } = req.validData || {};
            const data = await ScheduleSV.listByEntity(req.payload, entity, entityId, { from, to, options });
            return res.status(200).json(ApiResponse.success({ data }));
        } catch (e) {
            console.error(`ScheduleCT listBy(${entity}) error:`, e);
            return res.status(e.code || 500).json(ApiResponse.error(e));
        }
    };

    overview = async (req, res) => {
        try {
            const { from, to, Org } = req.validData || {};
            const data = await ScheduleSV.overview(req.payload, { from, to, Org });
            return res.status(200).json(ApiResponse.success({ data }));
        } catch (e) {
            console.error('ScheduleCT overview error:', e);
            return res.status(e.code || 500).json(ApiResponse.error(e));
        }
    };

    editLesson = async (req, res) => {
        try {
            const id = req.params.id;
            const doc = req.validData || {};
            delete doc.id;
            const { item } = await ScheduleSV.editLesson(req.payload, id, doc);
            return res.status(200).json(ApiResponse.success({ data: { item } }));
        } catch (e) {
            console.error('ScheduleCT editLesson error:', e);
            return res.status(e.code || 500).json(ApiResponse.error(e));
        }
    };

    cancelLesson = async (req, res) => {
        try {
            const id = req.params.id;
            const { item } = await ScheduleSV.cancelLesson(req.payload, id);
            return res.status(200).json(ApiResponse.success({ data: { item } }));
        } catch (e) {
            console.error('ScheduleCT cancelLesson error:', e);
            return res.status(e.code || 500).json(ApiResponse.error(e));
        }
    };

    checkConflicts = async (req, res) => {
        try {
            const { start, end, teacher, room, student, excludeLessonId } = req.validData || {};
            const conflicts = await ScheduleSV.checkConflicts(req.payload, {
                start, end, teacher, room, student, excludeLessonId
            });
            return res.status(200).json(ApiResponse.success({ data: { conflicts } }));
        } catch (e) {
            console.error('ScheduleCT checkConflicts error:', e);
            return res.status(e.code || 500).json(ApiResponse.error(e));
        }
    };

    parseSlots = async (req, res) => {
        try {
            const { text, context, anchorDate } = req.validData || {};
            const data = await ScheduleSV.parseSlots(req.payload, { text, context, anchorDate });
            // LLM 失败不算 5xx, 而是 200 + error 字段
            return res.status(200).json(ApiResponse.success({ data }));
        } catch (e) {
            console.error('ScheduleCT parseSlots error:', e);
            return res.status(e.code || 500).json(ApiResponse.error(e));
        }
    };

    confirmSlots = async (req, res) => {
        try {
            const { target, targetId, slots, mode } = req.validData || {};
            const { item } = await ScheduleSV.confirmSlots(req.payload, { target, targetId, slots, mode });
            return res.status(200).json(ApiResponse.success({ data: { item } }));
        } catch (e) {
            console.error('ScheduleCT confirmSlots error:', e);
            return res.status(e.code || 500).json(ApiResponse.error(e));
        }
    };
}

module.exports = new ScheduleCT();
