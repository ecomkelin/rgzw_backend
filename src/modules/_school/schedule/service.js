const { CourseModel }   = require('@models/school/course/Course.model');
const { LessonModel }   = require('@models/school/lesson/Lesson.model');
const { RoomModel }     = require('@models/organization/physical/Room.model');
const { UserModel }     = require('@models/organization/structure/User.model');
const { StudentModel }  = require('@models/school/student/Student.model');
const { StudentCourseModel } = require('@models/school/student/StudentCourse.model');
const { expand, toLessonDocs } = require('./lib/expander');
const conflictsLib = require('./lib/conflicts');
const llmLib = require('./lib/llm');
const { deleteImmutableFront } = require('@utils/fieldAttributes');
const ApiResponse = require('@utils/response');

class ScheduleSV {
    /**
     * 预览: 给定 courseId + 时间窗, 展开成 N 条 LessonPreview (不写库)
     */
    async preview(payload, { courseId, from, to }) {
        const course = await CourseModel.findById(courseId);
        if (!course) throw ({ code: 404, message: '课程不存在' });

        const rangeFrom = from || course.startDate || new Date();
        const rangeTo   = to   || course.endDate   || new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);

        const previews = expand(course, rangeFrom, rangeTo);

        // 给每条 preview 算一次冲突
        for (const p of previews) {
            p.conflicts = await conflictsLib.check({
                start: p.plannedDate,
                end:   p.plannedEndDate,
                teacher: p.teacher,
                room:    p.classroom
            });
        }
        return { items: previews, total: previews.length, course: { _id: course._id, name: course.name, totalSessions: course.totalSessions } };
    }

    /**
     * 生成: 真正写库
     */
    async generate(payload, { courseId, from, to, replace }) {
        const course = await CourseModel.findById(courseId);
        if (!course) throw ({ code: 404, message: '课程不存在' });

        const existing = await LessonModel.countDocuments({ Course: courseId, status: { $nin: ['cancelled'] } });
        if (existing > 0 && !replace) {
            throw ({ code: 400, message: `该课程已存在 ${existing} 个未取消 Lesson, 请传 replace=true 重新生成` });
        }

        const rangeFrom = from || course.startDate || new Date();
        const rangeTo   = to   || course.endDate   || new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);

        const previews = expand(course, rangeFrom, rangeTo);
        if (!previews.length) return { items: [], total: 0 };

        if (replace) {
            await LessonModel.deleteMany({ Course: courseId, status: 'scheduled' });
        }

        const docs = toLessonDocs(course, previews, payload);
        const inserted = await LessonModel.insertMany(docs, { ordered: false });
        return { items: inserted, total: inserted.length };
    }

    /**
     * 通用: 按维度查 Lesson 列表
     */
    async listByEntity(payload, entity, entityId, { from, to, options } = {}) {
        const filter = { status: { $nin: ['cancelled'] } };
        if (from) filter.plannedDate = { $gte: new Date(from) };
        if (to)   filter.plannedEndDate = { $lte: new Date(to) };

        if (entity === 'course') {
            filter.Course = entityId;
            // 老师只能看自己
            if (payload.currentUser && payload.currentUser.roleTemp !== 'manager') {
                filter.$or = [
                    { teacher: payload.currentUser._id },
                    { 'Course.mainTeacher': payload.currentUser._id },
                    { 'Course.assistantTeacher': payload.currentUser._id }
                ];
            }
        } else if (entity === 'room') {
            filter.classroom = entityId;
        } else if (entity === 'teacher') {
            filter.teacher = entityId;
            if (payload.currentUser && payload.currentUser.roleTemp !== 'manager' &&
                payload.currentUser._id.toString() !== entityId.toString()) {
                // 老师只能看自己
                throw ({ code: 403, message: '只能查看自己的课表' });
            }
        } else if (entity === 'student') {
            // 找学生报名的所有课程, 再用 Course 过滤
            const scs = await StudentCourseModel.find({ Student: entityId, status: 'active' }).select('Course').lean();
            const courseIds = scs.map(s => s.Course);
            filter.Course = { $in: courseIds };
        } else {
            throw ({ code: 400, message: `未知 entity: ${entity}` });
        }

        const items = await LessonModel.find(filter)
            .populate('Course',    'name')
            .populate('teacher',   'nickname')
            .populate('classroom', 'name')
            .skip((options?.skip || 0))
            .limit(Math.min(options?.limit || 500, 1000))
            .sort({ plannedDate: 1 });
        const total = await LessonModel.countDocuments(filter);

        return { items, total };
    }

    /**
     * 全校汇总: 按 (天 × 时段开始时间) 分组, 每个槽含 course/teacher/room/studentCount
     */
    async overview(payload, { from, to, Org } = {}) {
        const match = { status: { $nin: ['cancelled'] } };
        if (from) match.plannedDate    = { $gte: new Date(from) };
        if (to)   match.plannedEndDate = { $lte: new Date(to) };
        if (Org)  match.Org = Org;
        if (payload?.currentUser?.Org && payload.currentUser.roleTemp !== 'manager') {
            match.Org = payload.currentUser.Org;
        }

        const lessons = await LessonModel.find(match)
            .populate('Course',    'name')
            .populate('teacher',   'nickname')
            .populate('classroom', 'name')
            .sort({ plannedDate: 1 })
            .lean();

        // 一次算所有涉及的课程的 studentCount
        const courseIds = [...new Set(lessons.map(l => l.Course?._id?.toString()).filter(Boolean))];
        const scCounts = await StudentCourseModel.aggregate([
            { $match: { Course: { $in: courseIds.map(id => require('mongoose').Types.ObjectId.createFromHexString(id)) }, status: 'active' } },
            { $group: { _id: '$Course', count: { $sum: 1 } } }
        ]);
        const countMap = new Map(scCounts.map(s => [s._id.toString(), s.count]));

        const dayMap = new Map();
        for (const l of lessons) {
            const d = l.plannedDate;
            const dateKey = new Date(d).toISOString().slice(0, 10);
            const startHHMM = new Date(d).toISOString().slice(11, 16);
            const endHHMM   = l.plannedEndDate ? new Date(l.plannedEndDate).toISOString().slice(11, 16) : '';
            if (!dayMap.has(dateKey)) dayMap.set(dateKey, new Map());
            const slotMap = dayMap.get(dateKey);
            const slotKey = startHHMM + '|' + endHHMM;
            if (!slotMap.has(slotKey)) slotMap.set(slotKey, { startTime: startHHMM, endTime: endHHMM, items: [] });
            slotMap.get(slotKey).items.push({
                lessonId: l._id,
                courseId: l.Course?._id,
                courseName: l.Course?.name || '',
                teacherId: l.teacher?._id,
                teacherName: l.teacher?.nickname || '',
                roomId: l.classroom?._id,
                roomName: l.classroom?.name || '',
                studentCount: countMap.get(l.Course?._id?.toString()) || 0,
                sequenceNumber: l.sequenceNumber,
                status: l.status
            });
        }

        const days = [];
        for (const [date, slotMap] of [...dayMap.entries()].sort()) {
            const slots = [...slotMap.values()].sort((a, b) => a.startTime.localeCompare(b.startTime));
            days.push({ date, slots });
        }
        return { days };
    }

    /**
     * 单条编辑
     */
    async editLesson(payload, id, doc) {
        const lesson = await LessonModel.findById(id);
        if (!lesson) throw ({ code: 404, message: 'Lesson 不存在' });

        // Org 范围校验
        if (payload?.currentUser?.Org && payload.currentUser.roleTemp !== 'manager' &&
            lesson.Org.toString() !== payload.currentUser.Org.toString()) {
            throw ({ code: 403, message: '您无权修改此 Lesson' });
        }
        // 老师只能改自己授课的
        if (payload?.currentUser?.roleTemp === 'teacher' &&
            lesson.teacher && lesson.teacher.toString() !== payload.currentUser._id.toString()) {
            throw ({ code: 403, message: '只能修改自己授课的 Lesson' });
        }

        lesson.set(doc);
        lesson.updatedBy = payload?.currentUser?._id;
        await lesson.save();
        return { item: lesson };
    }

    /**
     * 单条取消
     */
    async cancelLesson(payload, id) {
        return this.editLesson(payload, id, { status: 'cancelled' });
    }

    /**
     * 冲突检测 (透传)
     */
    async checkConflicts(payload, win) {
        return conflictsLib.check(win);
    }

    /**
     * AI 解析
     */
    async parseSlots(payload, input) {
        return llmLib.parseSlots(input);
    }

    /**
     * AI 解析确认写入
     */
    async confirmSlots(payload, { target, targetId, slots, mode = 'append' }) {
        const Model = target === 'student' ? StudentModel
                    : target === 'room'    ? RoomModel
                    : UserModel;
        const fieldName = target === 'room' ? 'closedSlots' : 'unavailableSlots';
        const doc = await Model.findById(targetId);
        if (!doc) throw ({ code: 404, message: '目标对象不存在' });

        if (mode === 'replace') {
            doc[fieldName] = slots;
        } else {
            doc[fieldName] = [...(doc[fieldName] || []), ...slots];
        }
        await doc.save();
        return { item: doc };
    }
}

module.exports = new ScheduleSV();
