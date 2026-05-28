const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const LessonEvaluationEnums = {
  ratingEnums: [1, 2, 3, 4, 5]  // 可选评分范围
};

const LessonEvaluationDOC = {
  // ==================== 关联 ====================
  Lesson: { type: ObjectId, ref: 'Lesson', required: true },
  Student: { type: ObjectId, ref: 'Student', required: true },
  Teacher: { type: ObjectId, ref: 'User', required: true },     // 评价老师（通常为该课次老师）

  // ==================== 评价内容 ====================
  content: { type: String },                                     // 文字评价（教师评语）
  // 多维度评分，例如：{ "理解能力": 5, "动手能力": 4, "课堂参与": 5 }
  ratings: { type: Map, of: Number },

  // ==================== 配图（可选） ====================
  images: [{ type: String }],                                    // 图片URL数组

  // ==================== 家长/学生反馈 ====================
  parentFeedback: {
    content: { type: String },
    createdAt: { type: Date }
  },

  // ==================== 审计与隔离 ====================
  Org: { type: ObjectId, ref: 'Org', required: true },
  createdBy: { type: ObjectId, ref: 'User', immutable: true },   // 通常为教师
  updatedBy: { type: ObjectId, ref: 'User' }
};

const evaluationSchema = new Schema(LessonEvaluationDOC, { timestamps: true });

// 索引
evaluationSchema.index({ Lesson: 1, Student: 1 }, { unique: true });  // 每个学生每课次一条评价
evaluationSchema.index({ Student: 1 });                                  // 按学生查所有评价
evaluationSchema.index({ Teacher: 1 });                                  // 按老师查评价

const LessonEvaluationModel = mongoose.model('LessonEvaluation', evaluationSchema);
module.exports = { LessonEvaluationModel, LessonEvaluationEnums, LessonEvaluationDOC };