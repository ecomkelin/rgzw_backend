/**
 * 科目 学校开设哪些科目
 * 科目的类型 先写简单的 分类 后面再写完整
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


const SubjectEnums = {
    categoryEnums: ['C++', 'Python', 'Scratch', 'Spike', '电子智慧大颗粒'],
};

const SubjectDOC = {
    // Category: { type: ObjectId, required: true, ref: 'Category' }, // 比如 属于python类, 暂时先不用, 以免更多的代码
    // Labels: [{ type: ObjectId, ref: 'Label' }],
    category: { type: String, enum: SubjectEnums.categoryEnums, },

    // // 哪些课包 可以消课, 如果学生报名了 course, 则确认使用哪个StudentPack
    // 暂时也不写 因为有点复杂， 人工去做就可以了
    // Packs: [{ type: ObjectId, ref: 'Pack' }], 

    name: { type: String, required: true }, // 这里叫 python 初级

    /** 课程信息 */
    price: { type: Number }, // 课程 每堂课价格，原价 单位：分
    duration_minutes: { type: Number, default: 90 }, // 课程时长，单位：分钟
    default_lesson_count: { type: Number, default: 16 }, // 标准课时 16
    // 教学大纲
    syllabus: [{
        title: String,
        description: String,
    }],
    // 适合人群
    // target_audience: [{ type: String }],

    /** 宣传 */
    // 教学目标
    objectives: [{ type: String }],
    // 海报
    posterUrl: { type: String },
    description: { type: String }, // 课程简介, 富文本
    videoUrl: { type: String }, // 宣传视频

    // 精彩视频(查看 相关课程数组的 course.hlVideoUrl)

    sort: { type: Number, default: 0 }, // 排序，数值越大越靠前
    isActive: { type: Boolean, default: true },
    isShow: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },// 创建时间
    updatedAt: { type: Date, default: Date.now },
    Org: { type: ObjectId, ref: 'Org', required: true }, // 课程所属机构
}
const docSchema = new Schema(SubjectDOC);

docSchema.index({ name: 1, Org: 1 }, { unique: true })

const SubjectModel = mongoose.model('Subject', docSchema);

module.exports = {
    SubjectModel,
    SubjectEnums,
    SubjectDOC
}