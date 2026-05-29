const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const doc = {
  org: { type: ObjectId, ref: "Org", required: true },

  code: { type: String, required: true, unique: true, trim: true }, // 唯一标识
  apiPath: { type: String, required: true },
  apiMethod: {
    type: String,
    required: true,
    enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  },

  // 分类 如： structure:user auth:login. 用来区分是哪个模块的权限方便前端查看
  categoryTags: [{ type: String }],
  description: { type: String },
};
const docSchema = new Schema(doc, { timestamps: true, });

module.exports = mongoose.model("ApiPermission", docSchema);
