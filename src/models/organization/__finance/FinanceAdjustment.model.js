const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const doc = {
    Org: { type: ObjectId, ref: 'Org', required: true }, // 机构ID

    adjustNo: { type: String }, // "ADJ20241122001", // 调账单号
    FinanceAccount: { type: ObjectId, ref: 'FinanceAccount' }, // 关联需要调整的流水ID
    reason: { type: String }, // "金额录入错误", // 调账原因
    originalAmount: { type: Number }, // 原金额
    adjustedAmount: { type: Number }, // 调整后金额
    difference: { type: Number }, // 差额（调整后-原金额）
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }, // pending（待审批）/approved（已审批）/rejected（已驳回）
    User_approver: { type: ObjectId, ref: "User" }, // 审批人
};
const docSchema = new Schema(doc, { timestamps: true });
module.exports = mongoose.model('FinanceAdjustment', docSchema);