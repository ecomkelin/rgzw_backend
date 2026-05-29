const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const doc = {
  User: { type: ObjectId, ref: "User" },
  Org: { type: ObjectId, ref: "Org", required: true },

  // 用户自定义的 apiRoleIds
  customRoleIds: [{ type: ObjectId, ref: "ApiRole" }],

  // 主要用于屏蔽 user.departmentIds.apiRoleIds组合的 最终得到 depApiRoleIds 
  maskRoleIds: [{ type: ObjectId, ref: "ApiRole" }],

  // 由 customRoleIds 和 depApiRoleIds 计算组成的
  apiRoleIds: [{ type: ObjectId, ref: "ApiRole" }],
};
const docSchema = new Schema(doc, { timestamps: true });

module.exports = mongoose.model("UserApiRole", docSchema);
