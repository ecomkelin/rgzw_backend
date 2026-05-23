const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const doc = {
    name: { type: String, required: true }, // 课程包名称
    description: { type: String }, // 课程包描述
    // 几节课
    courseCount: { type: Number, required: true, default: 16 },

    // 原价
    price_regular: { type: Number, required: true }, // 课程包价格
    price_sale: { type: Number }, // 课包的活动价格

    Subjects: [{ type: ObjectId, ref: 'Subject' }], // 可以学习的科目列表

    isActive: { type: Boolean, default: true }, // 是否可用
    sort: { type: Number, default: 0 }, // 排序

    CreateBy: { type: ObjectId, required: true, ref: 'Manager' },

    createdAt: { type: Date, default: Date.now },// 创建时间
    Org: { type: ObjectId, ref: 'Org', required: true }, // 课程包所属机构
};
const docSchema = new Schema(doc);

module.exports = mongoose.model('Package', docSchema);