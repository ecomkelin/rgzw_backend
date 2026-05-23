const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const doc = {
    Student: { type: ObjectId, required: true, ref: 'Student' },
    Package: { type: ObjectId, ref: 'Package' }, // 购买的课程包

    price_regular: { type: Number, required: true }, // 课包原价
    price_sale: { type: Number }, // 课包折扣价
    price_order: { type: Number, required: true }, // 订单实际支付价格

    Course: { type: ObjectId, ref: 'Course' }, // 主要学习的课程
    Subjects: [{ type: ObjectId, ref: 'Subject' }], // 购买的课程列表
    payStatus: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' }, // 订单状态

    createdAt: { type: Date, default: Date.now },// 创建时间
    createBy: { type: ObjectId, required: true, ref: 'User' },
    Org: { type: ObjectId, ref: 'Org', required: true }, // 订单所属机构
};
const docSchema = new Schema(doc);

docSchema.index({ Student: 1 });
docSchema.index({ Package: 1 });
docSchema.index({ Course: 1 });
docSchema.index({ createdAt: 1 });

module.exports = mongoose.model('OrderPackage', docSchema);