/** 学生报名了某一个课程
 * 人工智能 让我用 Enrollment 命名
 * 我没有用 因为 这样是学生跟课程的关联 更好找
 * 管理员可以指定 让学生使用哪个 学生课包StudentPack
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const StudentCourseEnums = {
    statusEnums: ['active', 'finished', 'dropped', 'transferred']
};

const StudentCourseDOC = {
    // ==================== 关联核心学生 ====================
    Student: { type: ObjectId, ref: 'Student', required: true, immutable: true },
    Account: { type: ObjectId, ref: 'Account', required: true, immutable: true },  // 家长账户，便于查询

    // ==================== 关联核心课程 ====================
    Course: { type: ObjectId, ref: 'Course', required: true, immutable: true },              // 确保 Course.Org和Student.Org 相同
    nameCourse: { type: String, required: true, immutable: true },            // Course 冗余过来的 name

    // ==================== 课包绑定 ====================
    StudentPack: { type: ObjectId, ref: 'StudentPack' },    // 由管理员 选择要使用的课包。 可后期添加及修改, 确保和student.Org相同

    // ==================== 报名信息 ====================
    StudentCourseDate: { type: Date, default: Date.now },            // 报名日期
    status: { type: String, enum: StudentCourseEnums.statusEnums, default: 'active' },

    // ==================== 扩展信息 ====================
    remark: { type: String },                                     // 备注（如: 特殊要求, 孩子需要特殊关注）

    // ==================== 审计与隔离 ====================
    Org: { type: ObjectId, ref: 'Org', required: true, immutable: true },        // 确保和Student.Org 相同
    createdBy: { type: ObjectId, ref: 'User', immutable: true },
    updatedBy: { type: ObjectId, ref: 'User' }
};

const StudentCourseSchema = new Schema(StudentCourseDOC, { timestamps: true });

// 同一学生不能重复报名同一门课程
StudentCourseSchema.index({ Student: 1, Course: 1 }, { unique: true });
StudentCourseSchema.index({ Course: 1, status: 1 });               // 查询某课程在读学生
StudentCourseSchema.index({ Account: 1 });                         // 家长快速查看所有孩子报名

const StudentCourseModel = mongoose.model('StudentCourse', StudentCourseSchema);
module.exports = { StudentCourseModel, StudentCourseEnums, StudentCourseDOC };