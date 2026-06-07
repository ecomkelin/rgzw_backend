/**
 * 某个学校公司Org的教室
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const TimeBlockSchema = require('@models/__global/TimeBlock.schema');

const RoomEnums = {
  statusEnums: ['available', 'in_use', 'maintenance']  // 可用 / 使用中 / 维护中
};

const RoomDOC = {
  // ==================== 基本信息 ====================
  name: { type: String, required: true },         // 教室名称，如“101多媒体教室”
  capacity: { type: Number, default: 10 },        // 容纳人数
  location: { type: String },                     // 位置描述，如“一楼东侧”
  description: { type: String },                  // 备注（设备情况等）

  // ==================== 状态 ====================
  status: {
    type: String,
    enum: RoomEnums.statusEnums,
    default: 'available'
  },
  isActive: { type: Boolean, default: true },

  // 排课: 教室闭馆时段 (维护 / 改用途 / 临时外借)
  closedSlots: [TimeBlockSchema],

  sort: { type: Number, default: 0 },           // 排序字段，数值越大越靠前

  // ==================== 归属与审计 ====================
  Org: { type: ObjectId, ref: 'Org', immutable: true, required: true },
  createdBy: { type: ObjectId, ref: 'User', immutable: true },
  updatedBy: { type: ObjectId, ref: 'User' }
};

const roomSchema = new Schema(RoomDOC, { timestamps: true });

// 索引
roomSchema.index({ Org: 1, name: 1 }, { unique: true });   // 同一机构下教室名称唯一
roomSchema.index({ Org: 1, isActive: 1 });

const RoomModel = mongoose.model('Room', roomSchema);
module.exports = { RoomModel, RoomEnums, RoomDOC };