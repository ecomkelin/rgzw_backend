const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const { DATA_RANGE } = require("@config/permission.config");
const rangeEnum = [DATA_RANGE.SELF, DATA_RANGE.DEPARTMENT, DATA_RANGE.COMPANY, DATA_RANGE.SYSTEM];

const doc = {
  User: { type: ObjectId, ref: "User", required: true },
  Org: { type: ObjectId, ref: "Org", required: true },

  apiPermissionCode: { type: String, ref: "ApiPermission" },
  range: {
    type: Number,
    enum: rangeEnum,
    default: DATA_RANGE.SYSTEM,
  },
  // 如果是部门级别，则需要指定部门
  departmentIds: [{ type: ObjectId, ref: "Department" }],
};
const docSchema = new Schema(doc, { timestamps: true });

const Model = mongoose.model("UserApiPermission", docSchema);
Model.doc = doc;
Model.modelEnums = { rangeEnum };

module.exports = Model;
