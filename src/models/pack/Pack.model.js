/**
 * 公司需要发布课包 让学生购买
 * 课包有自己名称价钱
 * 主要是 哪些课程 可以为这个课包消课。 
 * 现在可以先让 公司员工选择就可以
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const PackEnums = {
  typeEnums: ['课时包', '学期包', '体验包', '定制包']
};

const PackDOC = {
  // ==================== 基础信息 ====================
  name: { type: String, required: true, immutable: true },            // 课包名称，如“Python 16课时常规包”
  type: { type: String, enum: PackEnums.typeEnums, default: '课时包', required: true },  // 课包类型，默认为“课时包”
  description: { type: String },

  // ==================== 课时 ====================
  totalLesson: { type: Number, required: true, default: 16, immutable: true },   // 课包总课时（消课按次扣，1次课消耗1课时）

  // ==================== 有效期 ====================
  validDays: { type: Number },                                 // 购买后有效天数，如 365 表示一年
  expireDate: { type: Date },                                  // 固定到期日（可选，一般不直接用）

  // ==================== 价格 ====================
  priceOrigin: { type: Number, required: true },               // 原价（单位：分）
  priceRegular: { type: Number, required: true },              // 常规售价
  priceSale: { type: Number },                                 // 活动价（可配合活动/优惠券）

  // ==================== 适用范围（暂用描述，后续可加关联） ====================
  applicableSubjects: { type: String },                        // 适用科目描述，如“Python、C++”
  applicableLevels: { type: String },                          // 适用级别，如“初级、中级”

  // ==================== 状态与展示 ====================
  isActive: { type: Boolean, default: true },
  sort: { type: Number, default: 0 },

  // ==================== 审计 ====================
  createdBy: { type: ObjectId, ref: 'User', required: true, immutable: true },  // 改为 User 与系统对齐
  updatedBy: { type: ObjectId, ref: 'User' },
  Org: { type: ObjectId, ref: 'Org', required: true, immutable: true }
};

const packSchema = new Schema(PackDOC, { timestamps: true });

packSchema.index({ Org: 1, isActive: 1 });
packSchema.index({ name: 1, Org: 1 }, { unique: true });      // 同机构下课包名不重复

const PackModel = mongoose.model('Pack', packSchema);
module.exports = { PackModel, PackEnums, PackDOC };