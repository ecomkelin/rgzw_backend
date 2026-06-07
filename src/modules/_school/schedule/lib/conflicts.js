/**
 * 冲突检测: 给定 [start, end] 窗口 + (teacher/room/student), 找出所有冲突源
 *
 * 返回: Array<{ type, message, lessonId?, ref? }>
 *   type ∈ teacher_busy | teacher_unavailable | room_busy | room_closed | student_busy | student_unavailable
 */
const { LessonModel } = require('@models/school/lesson/Lesson.model');
const { UserModel }   = require('@models/organization/structure/User.model');
const { RoomModel }   = require('@models/organization/physical/Room.model');
const { StudentModel }     = require('@models/school/student/Student.model');
const { StudentCourseModel } = require('@models/school/student/StudentCourse.model');
const { expandTimeBlocksToDates, overlaps } = require('@utils/timeBlock');

const busyStatuses = { $nin: ['cancelled'] };

/**
 * 找出某实体在 [start, end] 窗口内 busy 的 Lesson
 * @param {Object} filter   e.g. { teacher: id, classroom: id, Course: { $in: [...] } }
 * @param {Date}   start
 * @param {Date}   end
 * @param {String} excludeLessonId
 * @returns {Promise<Array>}
 */
const findBusyLessons = async (filter, start, end, excludeLessonId) => {
    return LessonModel.find({
        ...filter,
        _id: { $ne: excludeLessonId },
        status: busyStatuses,
        plannedDate:    { $lt: end },
        plannedEndDate: { $gt: start }
    })
    .populate('Course', 'name')
    .populate('teacher', 'nickname')
    .populate('classroom', 'name')
    .lean();
};

/**
 * 把 unavailableSlots / closedSlots 在 [start, end] 内展开, 与窗口求重叠
 */
const matchTimeBlocks = (blocks, start, end) => {
    if (!Array.isArray(blocks) || !blocks.length) return [];
    const expanded = expandTimeBlocksToDates(blocks, start, end);
    const hits = [];
    for (const d of expanded) {
        const ds = new Date(`${d.date}T${d.startTime}:00`);
        const de = new Date(`${d.date}T${d.endTime}:00`);
        if (overlaps(start, end, ds, de)) {
            // 找到对应的原始 block (简单按 reason 取)
            const reasonMatch = blocks.find(b => (b.reason || '') && (
                (b.dayOfWeek !== undefined) || b.date === d.date ||
                (b.dateRange && d.date >= b.dateRange.from && d.date <= b.dateRange.to)
            ));
            hits.push({
                date: d.date,
                startTime: d.startTime,
                endTime: d.endTime,
                reason: reasonMatch?.reason || ''
            });
        }
    }
    return hits;
};

/**
 * @param {Object} win { start, end, teacher?, room?, student?, excludeLessonId? }
 * @returns {Promise<Array>}
 */
const check = async (win) => {
    const out = [];
    if (!win || !win.start || !win.end) return out;
    const start = new Date(win.start);
    const end   = new Date(win.end);
    if (isNaN(start) || isNaN(end) || start >= end) return out;

    // 1) teacher busy
    if (win.teacher) {
        const busy = await findBusyLessons({ teacher: win.teacher }, start, end, win.excludeLessonId);
        for (const l of busy) {
            out.push({
                type: 'teacher_busy',
                message: `老师在该时段已有课: ${l.Course?.name || ''} (#${l.sequenceNumber})`,
                lessonId: l._id
            });
        }
        const u = await UserModel.findById(win.teacher).select('unavailableSlots').lean();
        const hits = matchTimeBlocks(u?.unavailableSlots, start, end);
        for (const h of hits) {
            out.push({
                type: 'teacher_unavailable',
                message: `老师不可用 (${h.date} ${h.startTime}-${h.endTime}${h.reason ? ' / ' + h.reason : ''})`
            });
        }
    }

    // 2) room busy + closed
    if (win.room) {
        const busy = await findBusyLessons({ classroom: win.room }, start, end, win.excludeLessonId);
        for (const l of busy) {
            out.push({
                type: 'room_busy',
                message: `教室在该时段已被占用: ${l.Course?.name || ''} (#${l.sequenceNumber})`,
                lessonId: l._id
            });
        }
        const r = await RoomModel.findById(win.room).select('closedSlots').lean();
        const hits = matchTimeBlocks(r?.closedSlots, start, end);
        for (const h of hits) {
            out.push({
                type: 'room_closed',
                message: `教室闭馆 (${h.date} ${h.startTime}-${h.endTime}${h.reason ? ' / ' + h.reason : ''})`
            });
        }
    }

    // 3) student busy + unavailable
    if (win.student) {
        const scs = await StudentCourseModel.find({ Student: win.student, status: 'active' }).select('Course').lean();
        if (scs.length) {
            const courseIds = scs.map(s => s.Course);
            const busy = await findBusyLessons({ Course: { $in: courseIds } }, start, end, win.excludeLessonId);
            for (const l of busy) {
                out.push({
                    type: 'student_busy',
                    message: `学生在该时段有课: ${l.Course?.name || ''} (#${l.sequenceNumber})`,
                    lessonId: l._id
                });
            }
        }
        const s = await StudentModel.findById(win.student).select('unavailableSlots').lean();
        const hits = matchTimeBlocks(s?.unavailableSlots, start, end);
        for (const h of hits) {
            out.push({
                type: 'student_unavailable',
                message: `学生不可用 (${h.date} ${h.startTime}-${h.endTime}${h.reason ? ' / ' + h.reason : ''})`
            });
        }
    }

    return out;
};

module.exports = { check, findBusyLessons, matchTimeBlocks };
