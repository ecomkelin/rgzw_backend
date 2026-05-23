/**
 * 科目 学校开设哪些科目
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const docSchema = new Schema({
    Category: { type: ObjectId, required: true, ref: 'Category' },
    Labels: [{ type: ObjectId, required: true, ref: 'Label' }],

    Pack: { type: ObjectId, ref: 'Pack' }, // 属于哪个 课程包

    name: { type: String, required: true },
    title: { type: String },    // 比如同样的课程 不同老师教 可能标题不一样

    /** 课程信息 */
    price: { type: Number }, // 课程价格， 单位：分
    duration_minutes: { type: Number }, // 课程时长，单位：分钟
    default_lesson_count: { type: Number }, // 标准课时 16
    // 教学大纲
    syllabus: [{ type: String }],
    // 适合人群
    target_audience: [{ type: String }],

    /** 宣传 */
    // 教学目标
    objectives: [{ type: String }],
    // 海报
    posterUrl: { type: String },
    description: { type: String }, // 课程简介, 富文本
    videoUrl: { type: String }, // 宣传视频

    // 精彩视频(查看 相关课程数组的 course.hlVideoUrl)

    meta: Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },// 创建时间

    Org: { type: ObjectId, ref: 'Org', required: true }, // 课程所属机构
});

docSchema.index({ Category: 1 });

module.exports = mongoose.model('Subject', docSchema);