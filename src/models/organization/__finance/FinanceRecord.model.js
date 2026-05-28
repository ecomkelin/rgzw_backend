const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const doc = {
    Org: { type: ObjectId, ref: 'Org', required: true }, // 机构ID

    recordNo: { type: String }, // "FIN20241121001", // 财务流水号
    bizType: { type: String },// "order_package", // 关联业务类型：order_package/order_product/salary
    bizId: { type: ObjectId }, // ObjectId("..."), // 关联业务记录ID
    type: { type: Number, enum: [1, -1] }, // 1 / -1, // 收支类型：income（收入）/expense（支出）
    amount: { type: Number }, // 2400, // 金额（收入为正，支出为负）
    paymentMethod: { type: String, enum: ['cash', 'credit_card', 'bank_transfer', 'online_payment'] }, // 支付方式
    accountId: { type: ObjectId, ref: 'finance_account' }, // 关联账户ID
    description: { type: String }, // 备注说明
    attachments: [String], // 附件，如发票扫描件等
    Category: { type: ObjectId, ref: 'finance_category' },//"course_package_sales", // 财务分类：课包销售/教具销售/薪资支出
    relatedParty: { type: ObjectId, ref: 'user' }, // 关联方（客户/员工）
    status: {
        type: String,
        enum: ['completed', 'pending', 'finished'],
        default: 'completed'
    },
    createBy: { type: ObjectId, ref: 'User' }
};

const docSchema = new Schema(doc, { timestamps: true });

module.exports = mongoose.model('FinanceRecord', docSchema);