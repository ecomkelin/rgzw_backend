/**
 * 学生每堂课的作品记录集
 * 每当Lesson的状态 变为 ongoing 进行时 则为每个学生生成一个作品记录集
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const LessonWorkDOC = {
    // ==================== 关联 ====================
    Subject: { type: ObjectId, ref: 'Subject' },                    // 冗余科目，方便查询
    Course: { type: ObjectId, ref: 'Course' },                      // 冗余课程，方便查询
    Lesson: { type: ObjectId, ref: 'Lesson', required: true },
    Student: { type: ObjectId, ref: 'Student', required: true },

    // ==================== 作品信息 ====================
    title: { type: String, required: true },                        // 作品名称
    description: { type: String },                                  // 作品描述
    images: [{ type: String }],                                     // 作品图片URL数组
    files: [{ type: String }],                                      // 其他文件（如源代码压缩包、视频等）

    // ==================== 展示控制 ====================
    isPublic: { type: Boolean, default: false },                    // 是否在作品广场公开显示

    // ==================== 审计与隔离 ====================
    Org: { type: ObjectId, ref: 'Org', required: true },
    createdBy: { type: ObjectId, ref: 'User' },                     // 上传者（可能是老师或家长）
    updatedBy: { type: ObjectId, ref: 'User' }
};

const workSchema = new Schema(LessonWorkDOC, { timestamps: true });

// 索引
workSchema.index({ Lesson: 1, Student: 1 });                     // 按课次+学生查作品
workSchema.index({ Student: 1, createdAt: -1 });                  // 学生作品时间线
workSchema.index({ isPublic: 1, createdAt: -1 });                 // 公开作品广场
workSchema.index({ Course: 1 });                                  // 按课程聚合作品

const LessonWorkModel = mongoose.model('LessonWork', workSchema);
module.exports = { LessonWorkModel, LessonWorkDOC };