// models/user.js (用户)
const mongoose = require("mongoose");
const { deleteImmutableFront } = require("@/utils/fieldAttributes");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const UserEnums = { roleSimpEnums: ['manager', 'teacher'] };

const UserDOC = {
    // 对应的账号ID，一个账号可以对应多个身份（User），但一个身份只能对应一个账号
    Account: { type: ObjectId, ref: 'Account', required: true, immutable: true },
    Org: { type: ObjectId, ref: 'Org', required: true, immutable: true },

    Depts: [{ type: ObjectId, ref: 'Dept' }],

    roleTemp: { type: String, enum: UserEnums.roleSimpEnums, default: 'teacher', required: true }, // 用户身份类型 organization / teacher / student
    nickname: { type: String, required: true }, // 昵称

    avatar: { type: String }, // 头像URL
    isActive: { type: Boolean, default: true }, // 是否启用
    sort: { type: Number, default: 0 }, // 排序字段，越大越靠前

    createdBy: { type: ObjectId, ref: 'Account', immutable: true },
    updatedBy: { type: ObjectId, ref: 'Account', deleteImmutableFront: true },
};
const docSchema = new Schema(UserDOC, { timestamps: true });
docSchema.index({ Account: 1, Org: 1 }, { unique: true });

const UserModel = mongoose.model('User', docSchema);

module.exports = {
  UserModel,
  UserEnums,
  UserDOC
};