const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const doc = {
    Org: { type: ObjectId, ref: 'Org', required: true },

    mould: { type: String, enum: ['Subject', 'Finance', 'Production'], required: true }, // 分类类型：subject/course

    level: { type: Number, default: 1 }, // 分类级别
    Parent: { type: ObjectId, required: true, ref: 'Category' },

    title: { type: String, required: true },
    description: { type: String },

    // 海报
    posterUrl: { type: String },

    isActive: { type: Boolean, default: true }, // 是否可用

    sort: { type: Number, default: 0 }, // 排序
};
const docSchema = new Schema(doc, { timestamps: true });

docSchema.index({ Org: 1, mould: 1, title: 1 }, { unique: true });

module.exports = mongoose.model('Category', docSchema);