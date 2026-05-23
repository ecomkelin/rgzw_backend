const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const doc = {
  User: { type: ObjectId, ref: "User" },
  Org: { type: ObjectId, ref: "Org", required: true },

  pageRoleIds: [{ type: ObjectId, ref: "ApiRole" }],
};

const docSchema = new Schema(doc, { timestamps: true });

module.exports = mongoose.model("UserPageRoles", docSchema);
