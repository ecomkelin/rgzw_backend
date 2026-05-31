// models/dept.js (部门)
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const doc = {
  Org: { type: ObjectId, ref: 'Org', required: true },
  
  level: { type: Number, default: 0 }, // 级别 默认根部门0
  Parent: { type: ObjectId, ref: 'Dept', default: null },
  
  code: { type: String },
  name: { type: String, required: true },
};
const docSchema = new Schema(doc, { timestamps: true });
docSchema.index({ org: 1 });
module.exports = mongoose.model('Dept', docSchema);

