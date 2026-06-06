/**
 * 学生购买课包订单， 支付完成后 生成此数据库
 * 这个数据库跟学生的消课有关
 * 每当 LessonAttendance 完成后 Lessons.push(_id)， remainingLesson-1
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const StudentPackEnums = {
  statusEnums: ['active', 'frozen', 'exhausted', 'refunded'],
  resourceEnums: ['OrderPack', 'free'],   // 因为有购买, 有送课, 有奖励 等
};

const StudentPackDOC = {
  // ==================== 归属 ====================
  resource: { type: String, enum: StudentPackEnums.resourceEnums, required: true, immutable: true }, // 学生课包来源
  OrderPack: { type: ObjectId, ref: 'OrderPack', immutable: true },     // 来源课包订单, 如果来源不是订单课包 则为空
  Student: { type: ObjectId, ref: 'Student', required: true, immutable: true },  // 学生 如果来源为课包订单 则由课包订单 冗余, 不然手动必填
  Account: { type: ObjectId, ref: 'Account', required: true, immutable: true },  // 学生账户 由学生 冗余

  // ==================== 课包内容 ====================
  Pack: { type: ObjectId, ref: 'Pack', immutable: true },    // 如果来源为课包订单 则由课包订单 冗余, 否则 手动必填
  packName: { type: String, required: true, immutable: true },              // 由课包 冗余
  totalLesson: { type: Number, required: true, immutable: true },            // 由课包 冗余
  LessonAttendances: [{ type: ObjectId, ref: 'LessonAttendance' }],       // 上过的课程, 前端不可修改, Lesson完成后自动添加到此
  remainingLesson: { type: Number, required: true, immutableFront: true },  // 剩余课时数量

  // ==================== 有效期 ====================
  activeDate: { type: Date, default: Date.now },                // 激活日期
  expireDate: { type: Date },

  // ==================== 状态 ====================
  status: { type: String, enum: StudentPackEnums.statusEnums, default: 'active' },

  // ==================== 审计 ====================
  Org: { type: ObjectId, ref: 'Org', required: true },
  createdBy: { type: ObjectId, ref: 'User', immutable: true },
  updatedBy: { type: ObjectId, ref: 'User' }
};

const studentPackSchema = new Schema(StudentPackDOC, { timestamps: true });
studentPackSchema.index({ Student: 1, status: 1 });
studentPackSchema.index({ Account: 1 });


const StudentPackModel = mongoose.model('StudentPack', studentPackSchema);
module.exports = { StudentPackModel, StudentPackEnums, StudentPackDOC };