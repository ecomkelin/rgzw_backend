const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const doc = {
  User: { type: ObjectId, ref: "User" },
  Org: { type: ObjectId, ref: "Org", required: true },

  pagePermissions: [
    {
      permission: String,
      range: {
        type: Number,
        enum: [DATA_RANGE.SELF, DATA_RANGE.DEPARTMENT, DATA_RANGE.COMPANY, DATA_RANGE.SYSTEM],
        default: DATA_RANGE.SYSTEM
      }
    }
  ],
};
const docSchema = new Schema(doc, { timestamps: true });

module.exports = mongoose.model("UserPagePermissions", docSchema);
