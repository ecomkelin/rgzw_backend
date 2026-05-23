const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const mouldEnums = ['Subject', 'Finance', 'Production'];

const doc = {
    Org: { type: ObjectId, ref: 'Org' },

    mould: { type: String, enum: mouldEnums, default: mouldEnums[0], required: true }, // 分类类型：subject/course

    name: { type: String, required: true },
    description: { type: String },

    // 海报
    posterUrl: { type: String },

    isActive: { type: Boolean, default: true }, // 是否可用
    sort: { type: Number, default: 0 }, // 排序

    createdBy: { type: ObjectId, ref: 'Account' },
    updatedBy: { type: ObjectId, ref: 'Account' },

    // 添加删除时间字段支持软删除
    deletedAt: { type: Date, default: null }
};
const docSchema = new Schema(doc, { timestamps: true });

docSchema.index({ Org: 1, mould: 1, name: 1 }, { unique: true });
docSchema.index({ Org: 1, mould: 1, isActive: 1, sort: 1 }); // 提高列表查询性能
docSchema.index({ createdAt: -1 }); // 按创建时间排序的优化
docSchema.index({ 'name': 'text', 'description': 'text' }); // 文本搜索优化

const Model = mongoose.model('Label', docSchema);

Model.doc = doc;
Model.modelEnums = { mouldEnums };

module.exports = Model;