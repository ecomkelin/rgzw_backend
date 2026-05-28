const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const CourseEnums = {
    statusEnums: ['draft', 'enrolling', 'ongoing', 'finished', 'cancelled'],
    frequencyEnums: ['weekly', 'daily', 'custom']
};

const CourseDOC = {
    // ==================== 关联模板 ====================
    Subject: { type: ObjectId, ref: 'Subject', required: true },

    // ==================== 班级标识 ====================
    title: { type: String, required: true },            // 班级标题，如“2026春Python初级班”

    // ==================== 教师 ====================
    mainTeacher: { type: ObjectId, ref: 'User', required: true },
    assistantTeacher: { type: ObjectId, ref: 'User' }, // 可选助教

    // ==================== 排课核心 ====================
    startDate: { type: Date, required: true },          // 开班日期
    endDate: { type: Date },                            // 预计结课日期（可选）
    totalSessions: { type: Number, required: true },     // 总课次，从 Subject 带过来，可覆盖

    frequency: { type: String, enum: CourseEnums.frequencyEnums, default: 'weekly' },

    // 排课规则
    scheduleRules: [{
        dayOfWeek: { type: Number, min: 0, max: 6 },      // 0=周日
        startTime: { type: String },                       // "18:30"
        endTime: { type: String }                          // "20:00"
    }],
    // 如果 frequency 为 custom，可存储具体日期数组
    customDates: [Date],

    // 默认教室（如有变动放在 Session 里）
    defaultClassroom: { type: ObjectId, ref: 'Classroom' },

    // ==================== 容量与价格 ====================
    maxStudents: { type: Number, default: 8 },
    price: { type: Number },                             // 报名价格，单位：分（原价/优惠价放订单）

    // ==================== 状态与发布 ====================
    status: { type: String, enum: CourseEnums.statusEnums, default: 'draft' },
    publishDate: { type: Date },                         // 对外发布/招生日期

    // ==================== 内容包装 ====================
    features: { type: String },                          // 本期特色
    description: { type: String },                       // 详细描述
    posterUrl: { type: String },
    videoUrl: { type: String },                          // 整体课程视频
    highlightVideoUrl: { type: String },                 // 精彩集锦

    // ==================== 通用管理 ====================
    isActive: { type: Boolean, default: true },
    Org: { type: ObjectId, ref: 'Org', required: true },
    createdBy: { type: ObjectId, ref: 'User', immutable: true },
    updatedBy: { type: ObjectId, ref: 'User', immutableFront: true }
};

const courseSchema = new Schema(CourseDOC, { timestamps: true });

// 索引
courseSchema.index({ Subject: 1, status: 1 });
courseSchema.index({ Org: 1, status: 1 });
courseSchema.index({ mainTeacher: 1, status: 1 });

const CourseModel = mongoose.model('Course', courseSchema);
module.exports = { CourseModel, CourseEnums, CourseDOC };