/** 学生报名了某一个课程
 * 人工智能 让我用 Enrollment 命名
 * 我没有用 因为 这样是学生跟课程的关联 更好找
 * 员工可以指定 让学生使用哪个课包
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const StudentCourseEnums = {
    statusEnums: ['active', 'finished', 'dropped', 'transferred']
};

const StudentCourseDOC = {
    // ==================== 关联核心 ====================
    Student: { type: ObjectId, ref: 'Student', required: true },
    Course: { type: ObjectId, ref: 'Course', required: true },
    Account: { type: ObjectId, ref: 'Account', required: true },  // 家长账户，便于查询

    // ==================== 课包绑定 ====================
    StudentPack: { type: ObjectId, ref: 'StudentPack' },    // 报名时选择的课包，用于消课

    // ==================== 报名信息 ====================
    enrollmentDate: { type: Date, default: Date.now },            // 报名日期
    status: { type: String, enum: StudentCourseEnums.statusEnums, default: 'active' },

    // ==================== 扩展信息 ====================
    remark: { type: String },                                     // 备注（如试听转正、特殊要求）

    // ==================== 审计与隔离 ====================
    Org: { type: ObjectId, ref: 'Org', required: true },
    createdBy: { type: ObjectId, ref: 'User', immutable: true },
    updatedBy: { type: ObjectId, ref: 'User' }
};

const enrollmentSchema = new Schema(StudentCourseDOC, { timestamps: true });

// 同一学生不能重复报名同一门课程
enrollmentSchema.index({ Student: 1, Course: 1 }, { unique: true });
enrollmentSchema.index({ Course: 1, status: 1 });               // 查询某课程在读学生
enrollmentSchema.index({ Account: 1 });                         // 家长快速查看所有孩子报名

const StudentCourseModel = mongoose.model('StudentCourse', enrollmentSchema);
module.exports = { StudentCourseModel, StudentCourseEnums, StudentCourseDOC };