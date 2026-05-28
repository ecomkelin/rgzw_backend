const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const OrderPackEnums = {
  payStatusEnums: ['Pending', 'Paid', 'Cancelled', 'Refunded'],
  payMethodEnums: ['wechat', 'alipay', 'cash', 'card', 'transfer']
};

const OrderPackDOC = {
  // ==================== 购买人 ====================
  Account: { type: ObjectId, ref: 'Account', required: true },  // 家长账户
  Student: { type: ObjectId, ref: 'Student', required: true },  // 为哪个学生购买

  // ==================== 课包快照（冗余，防篡改） ====================
  Pack: { type: ObjectId, ref: 'Pack' },
  packName: { type: String, required: true },
  totalLesson: { type: Number, required: true },                // 购买课时数
  validDays: { type: Number },                                  // 有效期天数

  // ==================== 价格 ====================
  priceOrigin: { type: Number },                                // 原价（分）
  priceRegular: { type: Number },                               // 常规售价
  priceSale: { type: Number },                                  // 折后价
  finalPrice: { type: Number, required: true },                 // 实付金额（分）

  // ==================== 支付信息 ====================
  payStatus: { type: String, enum: OrderPackEnums.payStatusEnums, default: 'Pending' },
  payMethod: { type: String, enum: OrderPackEnums.payMethodEnums },
  transactionId: { type: String },                              // 第三方流水号
  paidAt: { type: Date },

  // ==================== 关联课程（可选） ====================
  Course: { type: ObjectId, ref: 'Course' },                   // 如果直接报名班级，可填写

  // ==================== 备注与审计 ====================
  remark: { type: String },
  createdBy: { type: ObjectId, ref: 'User', required: true },
  updatedBy: { type: ObjectId, ref: 'User' },
  Org: { type: ObjectId, ref: 'Org', required: true }
};

const orderPackSchema = new Schema(OrderPackDOC, { timestamps: true });

orderPackSchema.index({ Account: 1, payStatus: 1 });
orderPackSchema.index({ Student: 1 });
orderPackSchema.index({ Org: 1, createdAt: -1 });

const OrderPackModel = mongoose.model('OrderPack', orderPackSchema);
module.exports = { OrderPackModel, OrderPackEnums, OrderPackDOC };