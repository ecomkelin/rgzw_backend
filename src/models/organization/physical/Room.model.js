const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const doc = {
    Org: { type: ObjectId, ref: 'Org', required: true }, // 机构ID
    name: { type: String, required: true },
};
const docSchema = new Schema(doc, { timestamps: true });
docSchema.index({ Org: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Room', docSchema);