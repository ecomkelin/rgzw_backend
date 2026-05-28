/**
 *  学生考勤， 即 学生每上一节课
 *  我用的是 LessonAttendance
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const LessonAttendanceEnums = {
    statusEnums: ['present', 'absent', 'late', 'leave', 'makeup']
    // present：正常出勤
    // absent：缺勤（未请假，默认状态）
    // late：迟到（仍算到课）
    // leave：请假（已批准，不扣课时）
    // makeup：补课（本条为补课记录，实际消耗课时在补课当次考勤）
};

const LessonAttendanceDOC = {
    // ==================== 关联 ====================
    Session: { type: ObjectId, ref: 'CourseSession', required: true },   // 哪一次课
    Student: { type: ObjectId, ref: 'Student', required: true },         // 哪个学生
    StudentCourse: { type: ObjectId, ref: 'StudentCourse' },                   // 报名记录（可选冗余）

    // ==================== 考勤状态 ====================
    status: { type: String, enum: LessonAttendanceEnums.statusEnums, default: 'absent' },

    // ==================== 消课关联 ====================
    StudentPack: { type: ObjectId, ref: 'StudentPack' },                  // 消耗的课包
    lessonConsumed: { type: Boolean, default: false },                   // 是否已从课包扣减课时

    // ==================== 补课双向关联 ====================
    // 如果本条是补课记录，指向原请假/缺勤记录
    originalAttendance: { type: ObjectId, ref: 'StudentAttendance', default: null },
    // 如果本条是请假/缺勤记录，且后续安排了补课，指向补课产生的记录
    makeupAttendance: { type: ObjectId, ref: 'StudentAttendance', default: null },

    // ==================== 时间记录 ====================
    checkInTime: { type: Date },    // 签到时间（实际到达，适用于 late/present）
    checkOutTime: { type: Date },   // 签退时间（可选）

    // ==================== 备注 ====================
    remark: { type: String },       // 备注（迟到原因、请假理由等）

    // ==================== 审计与隔离 ====================
    Org: { type: ObjectId, ref: 'Org', required: true },
    createdBy: { type: ObjectId, ref: 'User', immutable: true },
    updatedBy: { type: ObjectId, ref: 'User' }
};

const studentLessonSchema = new Schema(LessonAttendanceDOC, { timestamps: true });

// 同一学生在同一课次仅一条记录
studentLessonSchema.index({ StudentCourse: 1, Student: 1 }, { unique: true });
studentLessonSchema.index({ Student: 1, status: 1 });       // 按学生查考勤
studentLessonSchema.index({ StudentCourse: 1, status: 1 });       // 按课次查看出勤情况
studentLessonSchema.index({ Org: 1, createdAt: -1 });

const LessonAttendanceModel = mongoose.model('LessonAttendance', studentLessonSchema);
module.exports = { LessonAttendanceModel, LessonAttendanceEnums, LessonAttendanceDOC };