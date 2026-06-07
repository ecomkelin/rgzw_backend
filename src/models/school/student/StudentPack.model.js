/**
 * 学生持有课包
 * - 来源为 OrderPack 时:由 OrderPack.dao.add 在订单落库后自动创建,前端无 add 入口
 * - 来源为 free(赠送/活动/补偿)时:仅 Admin 可手动添加,Student + totalLesson 必填
 *
 * 字段语义:
 * - resource        : 课包来源,决定创建路径
 * - OrderPack       : 仅 resource='OrderPack' 时存在,做唯一稀疏索引防重复
 * - LessonAttendances: 关联已上过的课,Lesson 完成后由消课模块 push 到此数组
 * - remainingLesson : 剩余课时,初始化等于 totalLesson,后端消课时递减
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
  resource: { type: String, enum: StudentPackEnums.resourceEnums, required: true, immutable: true },
  Student: { type: ObjectId, ref: 'Student', required: true, immutable: true },
  Account: { type: ObjectId, ref: 'Account', required: true, immutable: true },  // 由 Student 冗余
  
  // ==================== 课包内容 ====================
  OrderPack: { type: ObjectId, ref: 'OrderPack', immutable: true },     // 来源课包订单, resource='OrderPack' 时必填
  Pack: { type: ObjectId, ref: 'Pack', immutable: true },    // resource='OrderPack' 时冗余, free 时为 null
  packName: { type: String, required: true, immutableFront: true },              // Pack 冗余 / free 可手动
  
  totalLesson: { type: Number, required: true },           // OrderPack 冗余 / free 必填
  LessonAttendances: [{ type: ObjectId, ref: 'LessonAttendance' }],              // 上过的课程, 前端不可修改
  remainingLesson: { type: Number, required: true },       // 剩余课时, 初始化 = totalLesson

  // ==================== 有效期 ====================
  activeDate: { type: Date, default: Date.now },                // 激活日期
  expireDate: { type: Date },                                   // 到期日, 可由 validDays 推导, 也可手动指定

  // ==================== 状态 ====================
  status: { type: String, enum: StudentPackEnums.statusEnums, default: 'active' },

  // ==================== 备注 ====================
  description: { type: String, maxLength: 500 },                // 赠送/活动说明,仅 free 来源时使用

  // ==================== 审计 ====================
  Org: { type: ObjectId, ref: 'Org', required: true, immutable: true },
  createdBy: { type: ObjectId, ref: 'User', immutable: true },
  updatedBy: { type: ObjectId, ref: 'User' }
};

const studentPackSchema = new Schema(StudentPackDOC, { timestamps: true });

studentPackSchema.index({ Student: 1, status: 1 });
studentPackSchema.index({ Account: 1 });
studentPackSchema.index({ Org: 1, createdAt: -1 });
// OrderPack 来源时强制唯一, 防止重复落地. free 来源时 OrderPack 为 null, 索引不参与.
studentPackSchema.index(
  { OrderPack: 1 },
  {
    unique: true,
    partialFilterExpression: { resource: 'OrderPack' }
  }
);

const StudentPackModel = mongoose.model('StudentPack', studentPackSchema);
module.exports = { StudentPackModel, StudentPackEnums, StudentPackDOC };
