const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const argon2 = require("argon2");

const AccountEnums = {
  genderEnums: ['male', 'female'],
  accountTypeEnums: ['User', 'Student']
};

const AccountDOC = {
  code: { type: String, required: true, immutable: true },
  passwordHash: { type: String, select: false, required: true },
  phone: { type: String }, // 联系电话
  name: { type: String, required: true },// 用户真实姓名
  identityNo: { type: String }, // 证件号码 身份证号/护照号
  
  // 角色类型：superAdmin（超级管理员）/orgAdmin（机构管理员）/staff（员工）
  accountType: { type: String, enum: AccountEnums.accountTypeEnums, default: "User", immutable: true },
  currentUser: { type: ObjectId, ref: 'User' }, // 关联的用户ID，accountType为User时关联User，为Student时关联Student
  currentStudent: { type: ObjectId, ref: 'Student' }, // 关联的学生ID，accountType为Student时关联Student
  isAdmin: { type: Boolean, default: false, immutable: true }, // 只有user 角色类型的账号才有isAdmin字段，表示是否是管理员账号
  isActive: { type: Boolean, default: true },
  
  // 证件信息
  gender: { type: String, enum: AccountEnums.genderEnums, default: 'male' },
  birthday: { type: Date }, // 出生日期
  address: { type: String }, // 户籍地址
  
  nickname: { type: String }, // 昵称

  // 现在住址 主要是为了方便查看和统计分析，实际使用中以Province/City/Area为准
  currentAddress: { type: String },
  Nation: { type: ObjectId, ref: 'Nation' }, // 民族
  Province: { type: ObjectId, ref: 'Province' }, // 省份 - 修正拼写错误
  City: { type: ObjectId, ref: 'City' }, // 城市
  Area: { type: ObjectId, ref: 'Area' }, // 区县

  // 登陆信息
  lastLoginAt: { type: Date, immutableFront: true },
  lastLoginIP: { type: String, immutableFront: true },
  lastLogoutAt: { type: Date, immutableFront: true },
  // 当前会话ID，用于防并发登录
  currentSessionId: { type: String, select: false },

  sort: { type: Number, default: 0 },
  createdBy: { type: ObjectId, ref: 'Account', immutable: true },
  updatedBy: { type: ObjectId, ref: 'Account', immutableFront: true },
};
const docSchema = new Schema(AccountDOC, { timestamps: true })

// 密码加密中间件
docSchema.pre("save", async function (next) {
  if (this.isModified("passwordHash")) {
    try {
      this.passwordHash = await argon2.hash(this.passwordHash, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// 验证密码的方法
docSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await argon2.verify(this.passwordHash, candidatePassword);
  } catch (error) {
    throw ({ code: 400, message: "密码验证失败" });
  }
};

docSchema.index({ code: 1 }, { unique: true });
docSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $exists: true, $ne: null } } });
docSchema.index({ identityNo: 1 }, { unique: true, partialFilterExpression: { identityNo: { $exists: true, $ne: null } } });

const AccountModel = mongoose.model('Account', docSchema);

module.exports = {
  AccountModel,
  AccountEnums,
  AccountDOC
};