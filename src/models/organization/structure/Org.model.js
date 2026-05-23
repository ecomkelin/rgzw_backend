// models/dept.js (部门)
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const doc = {
  unionCode: { type: String, required: true }, // 统一社会信用代码
  name: { type: String, required: true },
  nickname: { type: String, required: true },

  isMain: { type: Boolean, default: false }, // 是否主机构。主机构只能有一个，且不能删除

  // 公司信息
  phone: { type: String },
  email: { type: String },
  website: { type: String },

  Nation: { type: ObjectId, ref: 'Nation' }, // 民族
  Provence: { type: ObjectId, ref: 'Province' }, // 省份
  City: { type: ObjectId, ref: 'City' }, // 城市
  Area: { type: ObjectId, ref: 'Area' }, // 区县
  address: { type: String },


  isActive: { type: Boolean, default: true },
  sort: { type: Number, default: 0 },

  createdBy: { type: Schema.Types.ObjectId, ref: 'Account', immutable: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Account', immutableFront: true },
};
const docSchema = new Schema(doc, { timestamps: true });

docSchema.index({ name: 1 }, { unique: true });
docSchema.index({ unionCode: 1 }, { unique: true });

module.exports = mongoose.model('Org', docSchema);