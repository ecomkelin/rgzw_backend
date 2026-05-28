const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const docSchema = new Schema({
    Nation: { type: ObjectId, required: true, ref: 'Nation' },
    Province: { type: ObjectId, required: true, ref: 'Province' },
    City: { type: ObjectId, required: true, ref: 'City' },

    title: { type: String, required: true },

    isActive: { type: Boolean, default: true }, // 是否可用
    sort: { type: Number, default: 0 }, // 排序
});
docSchema.index({ City: 1, title: 1 }, { unique: true });

module.exports = mongoose.model('Area', docSchema);