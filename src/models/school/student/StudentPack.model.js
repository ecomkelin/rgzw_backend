/**
 * 学生购买课包订单， 支付完成后 生成此数据库
 * 这个数据库跟学生的消课有关
 * 每当 LessonAttendance 完成后 usedLesson+1， remainingLesson-1
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const StudentPackEnums = {
  statusEnums: ['active', 'frozen', 'exhausted', 'refunded']
};

const StudentPackDOC = {
  // ==================== 归属 ====================
  Account: { type: ObjectId, ref: 'Account', required: true },  // 家长
  Student: { type: ObjectId, ref: 'Student', required: true },  // 学生（必填，课时仅限该生使用）
  Order: { type: ObjectId, ref: 'OrderPack', required: true },     // 来源订单

  // ==================== 课包内容 ====================
  Pack: { type: ObjectId, ref: 'Pack' },
  packName: { type: String },
  subjectScope: { type: String },                               // 可用科目范围描述（从Pack带过来）
  totalLesson: { type: Number, required: true },
  usedLesson: { type: Number, default: 0 },
  remainingLesson: { type: Number, required: true },

  // ==================== 有效期 ====================
  activeDate: { type: Date, default: Date.now },                // 激活日期
  expireDate: { type: Date },

  // ==================== 状态 ====================
  status: { type: String, enum: ['active', 'frozen', 'exhausted', 'refunded'], default: 'active' },

  // ==================== 审计 ====================
  Org: { type: ObjectId, ref: 'Org', required: true },
  createdBy: { type: ObjectId, ref: 'User', immutable: true },
  updatedBy: { type: ObjectId, ref: 'User' }
};

const studentPackSchema = new Schema(StudentPackDOC, { timestamps: true });
studentPackSchema.index({ Student: 1, status: 1 });
studentPackSchema.index({ Account: 1 });


const StudentPackModel = mongoose.model('StudentPack', enrollmentSchema);
module.exports = { StudentPackModel, StudentPackEnums, StudentPackDOC };