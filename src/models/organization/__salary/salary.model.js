const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const doc = {
    User: { type: "ObjectId", ref: "User" }, // 员工
    Org: { type: ObjectId, ref: 'Org', required: true }, // 机构ID

    title: { type: String }, // "UserName 2024-10",
    month: { type: Date }, // "2024-10"
    baseSalary: { type: Number },       // 基本工资
    housingAllowance: { type: Number }, // 住房补贴
    transportAllowance: { type: Number }, // 交通补贴
    bonus: { type: Number },       // 奖金
    totalAmount: { type: Number }, // 总薪资

    payStatus: { type: String, enum: ["未发放", "已发放"] }, // 2=已发放
    FinanceRecordId: { type: ObjectId, ref: "FinanceRecord" }, // 关联财务流水
    payTime: { type: Date }, // 发放时间

    remarks: { type: String }, // 备注

    CreateBy: { type: "ObjectId", ref: "User" },
};
const docSchema = new Schema(doc, { timestamps: true });

module.exports = mongoose.model('Salary', docSchema);