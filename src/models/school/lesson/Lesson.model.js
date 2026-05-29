/**
 * 上的每一节课
 * StudentCourse 生成后 自动生成16个Lesson数据库
 * 老师的考勤 暂时在这里
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const LessonEnums = {
    statusEnums: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    teacherAttendanceEnums: ['present', 'absent', 'late', 'leave']
};

const LessonDOC = {
    // ==================== 关联 ====================
    Course: { type: ObjectId, ref: 'Course', required: true },
    Org: { type: ObjectId, ref: 'Org', required: true },

    // ==================== 课次标识 ====================
    sequenceNumber: { type: Number, required: true },    // 第几节课
    name: { type: String },                              // "第一课：Python环境安装"

    // ==================== 时间安排 ====================
    plannedDate: { type: Date, required: true },         // 计划日期+时间（开始）
    plannedEndDate: { type: Date },                      // 计划结束时间（可选，便于校验时长）
    actualStartTime: { type: Date },                     // 实际上课时间
    actualEndTime: { type: Date },                       // 实际下课时间

    // ==================== 教师 ====================
    teacher: { type: ObjectId, ref: 'User' },            // 本节老师（可代课，为空则默认 Course.mainTeacher）
    teacherAttendance: {                                 // 老师的考勤
        type: String,
        enum: LessonEnums.teacherAttendanceEnums,
        default: 'present'
    },

    // ==================== 教室 ====================
    classroom: { type: ObjectId, ref: 'Classroom' },     // 实际使用教室

    // ==================== 内容与总结 ====================
    description: { type: String },                       // 本节课教学内容摘要
    summary: { type: String },                           // 教师课后小结
    videoUrl: { type: String },                          // 录播视频
    highlightVideoUrl: { type: String },                 // 精彩片段

    // ==================== 状态 ====================
    status: {
        type: String,
        enum: LessonEnums.statusEnums,
        default: 'scheduled'
    },

    // ==================== 审计 ====================
    createdBy: { type: ObjectId, ref: 'User', immutable: true },
    updatedBy: { type: ObjectId, ref: 'User', immutableFront: true }
};

const lessonSchema = new Schema(LessonDOC, { timestamps: true });

// 索引
lessonSchema.index({ Course: 1, sequenceNumber: 1 }, { unique: true });
lessonSchema.index({ plannedDate: 1, teacher: 1 });
lessonSchema.index({ Org: 1, status: 1 });

const LessonModel = mongoose.model('Lesson', lessonSchema);
module.exports = { LessonModel, LessonEnums, LessonDOC };