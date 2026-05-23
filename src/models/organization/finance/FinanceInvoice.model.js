const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const doc = {
    Org: { type: ObjectId, ref: 'Org', required: true }, // 机构ID

    invoiceNo: { type: String }, //"SF20241122001", // 发票号码
    invoiceType: { type: String, enum: ["ordinary", "special"], default: "ordinary" }, // 发票类型：special（专票）/ordinary（普票）
    title: { type: String }, //"XX科技有限公司", // 发票抬头
    taxNo: { type: String }, //"91XXXXXXXXXXXXXX", // 税号
    amount: { type: Number }, //2400, // 发票金额
    FinanceRecords: [{ type: ObjectId, ref: 'FinanceRecord' }], // 关联的财务流水ID
    status: { type: String, enum: ["drafted", "issued", "cancelled"], default: "" }, // drafted（已开票）/issued（已寄出）/cancelled（已作废）
    issueTime: { type: Date }, // 开票时间
};

const docSchema = new Schema(doc, { timestamps: true });
docSchema.index({ invoiceNo: 1 }, { unique: true });

module.exports = mongoose.model('FinanceInvoice', docSchema);
