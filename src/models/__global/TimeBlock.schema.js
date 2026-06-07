/**
 * 通用"时间块"子 schema
 *
 * 复用 4 个地方:
 *   - Course.scheduleRules     一条排课规则
 *   - Student.unavailableSlots 一条学生不可用时段
 *   - Room.closedSlots         一条教室闭馆时段
 *   - User.unavailableSlots    一条老师不可用时段
 *
 * 三种时间范围(dayOfWeek / date / dateRange)互斥但同结构, 一条 TimeBlock 至少要有其一.
 * 使用时配合 src/utils/timeBlock.js 里的 validateTimeBlock / expandTimeBlocksToDates.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const dateStrRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeStrRegex = /^\d{2}:\d{2}$/;

const TimeBlockSchema = new Schema({
    // ========== 时间范围 (三选一) ==========
    dayOfWeek: { type: Number, min: 0, max: 6 },                     // 0=周日, 1..6=周一..周六
    date:      { type: String, match: dateStrRegex },                // 单日: 'YYYY-MM-DD'
    dateRange: {
        from: { type: String, match: dateStrRegex },
        to:   { type: String, match: dateStrRegex }
    },

    // ========== 时段 (必填, 24h 字符串) ==========
    startTime: { type: String, required: true, match: timeStrRegex },
    endTime:   { type: String, required: true, match: timeStrRegex },

    // ========== 备注 (原因 / 主题) ==========
    reason:    { type: String, maxlength: 200 },

    // ========== 仅 Course.scheduleRules 使用 ==========
    // 一条排课规则可独立指定该节老师/教室, 缺省回退到 course.mainTeacher / course.defaultRoom
    teacher:   { type: ObjectId, ref: 'User' },
    room:      { type: ObjectId, ref: 'Room' },
    note:      { type: String, maxlength: 200 }
}, { _id: false });

module.exports = TimeBlockSchema;

