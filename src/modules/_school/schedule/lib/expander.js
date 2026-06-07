/**
 * scheduleRules → Lesson[] 展开算法
 *
 * 输入: Course 文档 + 时间窗口 [from, to]
 * 输出: 纯计算的 LessonPreview 数组 (不写库)
 *
 * 关键决策:
 *  - 不自动跳过不可用时段 (Student/Room/User 的 unavailable/closed)
 *  - 冲突由 conflicts.check 在写入前后给出, 前端 preview 看到冲突再决定
 *  - totalSessions 是硬上限, 达到上限立刻停 (剩下的规则丢弃)
 */
const { validateTimeBlock, expandTimeBlocksToDates } = require('@utils/timeBlock');

/**
 * @param {Object} course        Course 文档 (含 scheduleRules, mainTeacher, defaultRoom, totalSessions)
 * @param {Date}   rangeFrom
 * @param {Date}   rangeTo
 * @returns {Array<{
 *   sequenceNumber: number,
 *   plannedDate: Date,
 *   plannedEndDate: Date,
 *   teacher: any,
 *   classroom: any,
 *   note: string,
 *   conflicts: []
 * }>}
 */
const expand = (course, rangeFrom, rangeTo) => {
    const out = [];
    if (!course || !course.scheduleRules || !course.scheduleRules.length) return out;
    if (!rangeFrom || !rangeTo) return out;

    for (const rule of course.scheduleRules) {
        if (!validateTimeBlock(rule)) continue;

        const dates = expandTimeBlocksToDates([rule], rangeFrom, rangeTo);
        for (const d of dates) {
            const plannedDate    = new Date(`${d.date}T${d.startTime}:00`);
            const plannedEndDate = new Date(`${d.date}T${d.endTime}:00`);

            out.push({
                sequenceNumber: out.length + 1,
                plannedDate,
                plannedEndDate,
                teacher:   rule.teacher || course.mainTeacher,
                classroom: rule.room    || course.defaultRoom,
                note:      rule.note || '',
                conflicts: []
            });

            if (out.length >= (course.totalSessions || Infinity)) {
                return out;
            }
        }
    }
    return out;
};

/**
 * 把 expand 出来的纯数据转换成可写库的 Lesson 文档
 */
const toLessonDocs = (course, previews, payload) => {
    return previews.map(p => ({
        Course:        course._id,
        Org:           course.Org,
        sequenceNumber: p.sequenceNumber,
        plannedDate:    p.plannedDate,
        plannedEndDate: p.plannedEndDate,
        teacher:   p.teacher,
        classroom: p.classroom,
        description: p.note,
        status: 'scheduled',
        createdBy: payload?.currentUser?._id
    }));
};

module.exports = { expand, toLessonDocs };
