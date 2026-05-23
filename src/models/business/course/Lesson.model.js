const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const doc = {
    course: { type: ObjectId, ref: 'Course', required: true },

    name: { type: String }, // 如 "第一课：Python环境安装"
    sequence_number: { type: Number }, // 第几节课

    teacher: { type: ObjectId, ref: 'User' }, // 允许临时代课，如果不填则默认是Course的老师

    description: { type: String },
    sort: { type: Number }, // 课程顺序

    videoUrl: { type: String },   // 课程视频地址
    hlVideoUrl: { type: String }, // 课程精彩视频地址

    createdAt: { type: Date, default: Date.now },// 创建时间

    Org: { type: ObjectId, ref: 'Org', required: true }, // 课程所属机构
};
const docSchema = new Schema(doc, { timestamps: true });

docSchema.index({ course: 1 });
docSchema.index({ teacher: 1 });

module.exports = mongoose.model('Lesson', docSchema);