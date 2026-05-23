const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const doc = {
    Student: { type: ObjectId, required: true, ref: 'student' },
    Course: { type: ObjectId, required: true, ref: 'course' },

    // 报名信息
    enrollmentDate: { type: Date, default: Date.now }, // 报名时间
    // 课程进度
    progress: { type: Number, default: 0 }, // 课程进度百分比

    Org: { type: ObjectId, ref: 'Org', required: true }, // 课程所属机构
};
const docSchema = new Schema(doc, { timestamps: true });

docSchema.index({ User: 1 });

module.exports = mongoose.model('StudentCourse', docSchema);