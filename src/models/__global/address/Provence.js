const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const docSchema = new Schema({
    Nation: { type: ObjectId, required: true, ref: 'Nation' },

    title: { type: String, required: true },

    isActive: { type: Boolean, default: true }, // 是否可用
    sort: { type: Number, default: 0 }, // 排序
});

docSchema.index({ title: 1 }, { unique: true });

module.exports = mongoose.model('Province', docSchema);