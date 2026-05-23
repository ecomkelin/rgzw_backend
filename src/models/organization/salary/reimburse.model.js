// 报销
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const doc = {
    User: { type: ObjectId, ref: "User" }, // 报销人
    Org: { type: ObjectId, ref: 'Org', required: true }, // 机构ID

    reimburseNo: { type: String }, // 报销单号
    category: { type: ObjectId, ref: "Category" }, // 报销类别
    amount: { type: Number },     // 单位 分
    reason: { type: String },  //"出差上海交通费",

    payStatus: { type: String, enum: ["等待报销", "已经报销"], default: "等待报销" }, // pending/approved/rejected
    payTime: { type: Date }, // 发放时间
    FinanceRecordId: { type: ObjectId, ref: "FinanceRecord" }, // 关联财务流水
};
const docSchema = new Schema(doc, { timestamps: true });

module.exports = mongoose.model('Reimburse', docSchema);