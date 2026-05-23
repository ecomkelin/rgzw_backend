const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const doc = {
  Org: { type: ObjectId, ref: "Org", required: true },

  departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
  // 部门自定义的 apiRoleIds 如果部门的apiRoleIds变动 则 要重新计算 UserApiRole.apiRoleIds
  apiRoleIds: [{ type: Schema.Types.ObjectId, ref: "ApiRole" }],
};
const docSchema = new Schema(doc, { timestamps: true, });

module.exports = mongoose.model("DepartmentApiRole", docSchema);
