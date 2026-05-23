const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const { DATA_RANGE } = require("@config/permission.config");
const rangeEnum = [DATA_RANGE.SELF, DATA_RANGE.DEPARTMENT, DATA_RANGE.COMPANY, DATA_RANGE.SYSTEM];
const doc = {
  Org: { type: ObjectId, ref: "Org", required: true },

  code: { type: String, required: true, unique: true },
  pagePermissions: [
    {
      permission: String,
      range: {
        type: Number,
        enum: rangeEnum,
        default: DATA_RANGE.SYSTEM
      }
    }
  ],
};
const docSchema = new Schema(doc, { timestamps: true });



module.exports = mongoose.model("PageRole", docSchema);
