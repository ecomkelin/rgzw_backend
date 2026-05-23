// 资金载体账户模型
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const doc = {
    Org: { type: ObjectId, ref: 'Org', required: true }, // 机构ID

    name: String, // "微信收款账户", // 账户名称
    type: { type: String, enum: ['electronic'] }, //"electronic", // 账户类型：cash（现金）/electronic（电子支付）/bank（银行账户）
    accountNo: { type: String }, //"wx123456", // 账号（银行账户填卡号，微信填商户号）
    balance: { type: Number }, // 56800.00, // 当前余额（系统自动计算）// 分
    isActive: { type: Boolean }, //"active", // active（启用）/inactive（停用）
}
const docSchema = new Schema(doc, { timestamps: true });

module.exports = mongoose.model('FinanceAccount', docSchema);