const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const doc = {
    Subject: { type: ObjectId, required: true, ref: 'subject' },

    // 课程发布日期， 格式：YYYY-MM-DD
    publish_date: { type: String, required: true },

    // 上课频次， 每周几上课， 时间点
    start_date: { type: Date, required: true, },
    end_date: { type: Date, required: true, },

    // 排课规则：每周几的几点上课
    schedule_config: [{
        day_of_week: { type: Number, min: 0, max: 6 }, // 0=周日
        start_time: String, // "18:30"
        end_time: String // "20:00"
    }],

    // 课程标题及描述
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number }, // 课程价格， 单位：分
    duration: { type: Number }, // 课程时长，单位：秒
    // 容纳学生人数
    max_students: { type: Number, default: 8 },
    status: {
        type: String,
        enum: ['recruiting', 'ongoing', 'finished'],
        default: 'recruiting'
    },

    features: { type: String }, // 本期特色
    // 授课教师
    main_teacher: { type: ObjectId, required: true, ref: 'teacher' },

    // 本课程的精彩视频， 上完课后上传的
    //讲课视频
    videoUrl: { type: String },   // 课程视频地址
    // 上完所有课后 精彩视频
    hlVideoUrl: { type: String }, // 课程精彩视频地址

    Org: { type: ObjectId, ref: 'Org', required: true }, // 课程所属机构
};
const docSchema = new Schema(doc, { timestamps: true });

docSchema.index({ Subject: 1 });
docSchema.index({ start_date: 1 });

module.exports = mongoose.model('Course', docSchema);