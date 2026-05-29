/**
 * 公司/机构/学校
 * 作为隔离层 以公司为基本单位
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const OrgEnums = {};
const OrgDOC = {
  unionCode: { type: String, required: true }, // 统一社会信用代码
  name: { type: String, required: true },
  nickname: { type: String, required: true },

  isMain: { type: Boolean, default: false }, // 是否主机构。主机构只能有一个

  // 公司信息
  phone: { type: String },
  email: { type: String },
  website: { type: String },

  Nation: { type: ObjectId, ref: 'Nation' }, // 民族
  Province: { type: ObjectId, ref: 'Province' }, // 省份 - 修正拼写错误
  City: { type: ObjectId, ref: 'City' }, // 城市
  Area: { type: ObjectId, ref: 'Area' }, // 区县
  address: { type: String },

  isActive: { type: Boolean, default: true },
  sort: { type: Number, default: 0 },

  createdBy: { type: Schema.Types.ObjectId, ref: 'Account', immutable: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Account', immutableFront: true },
};

const docSchema = new Schema(OrgDOC, { timestamps: true });

// 为经常查询的字段创建索引
docSchema.index({ unionCode: 1 }, { unique: true });
docSchema.index({ name: 1 }, { unique: true });
docSchema.index({ nickname: 1 }, { unique: true });

// 添加中间件，在保存前检查isMain字段的唯一性
docSchema.pre('save', async function (next) {
  if (this.isMain) {
    // 如果当前文档标记为主机构，将其他机构的isMain设为false
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, isMain: true },
      { isMain: false }
    );
  }
  next();
});

// 添加中间件，在更新时处理isMain字段
docSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();

  if (update.$set && update.$set.isMain === true) {
    // 如果正在将某个机构设置为主机构，将其他机构的isMain设为false
    const docId = this.getQuery()._id;
    await this.model.updateMany(
      { _id: { $ne: docId }, isMain: true },
      { isMain: false }
    );
  }
  next();
});

const OrgModel = mongoose.model('Org', docSchema);

module.exports = {
  OrgModel,
  OrgEnums,
  OrgDOC
};