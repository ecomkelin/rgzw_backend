/** 培训机构 招收的学生信息 学生有可能在上学 也有可能工作了
 * 学生信息主要是为了方便机构了解学生的基本情况，进行统计分析，以及后续的精准营销等使用
 * 一个账号下 可以有多个学生信息 因为 一个家长可能有多个孩子 也可能自己是学生 也可能是员工 也可能是家长 也可能是其他身份
 * 这样一个账号 可以管理多个学生信息
 * 
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const StudentEnums = {};
const StudentDOC = {
    // 对应的账号ID，一个账号可以对应多个身份（Student），但一个身份只能对应一个账号
    Account: { type: ObjectId, ref: 'Account', required: true, immutable: true },
    phone: { type: String },

    // 证件上的信息
    identity: { type: String },       // 身份证号
    name: { type: String },       // 真实姓名
    birthday: { type: Date },     // 出生日期
    gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },
    address: { type: String },   // 证件地址

    // 现居 地址信息
    currentAddress: { type: String },
    Nation: { type: ObjectId, ref: 'Nation' },  // 从 province 冗余过来的
    Provence: { type: ObjectId, ref: 'Province' }, // 从 City 冗余过来的
    City: { type: ObjectId, ref: 'City' },  // 从 Area 冗余过来的
    Area: { type: ObjectId, ref: 'Area' },

    // 工作/上学 信息
    company: { type: String },
    position: { type: String },
    school: { type: String },
    profession: { type: String },

    // 展示信息
    displayName: { type: String },
    avatar: { type: String },

    // 用户来源类型
    sourceType: { type: String, enum: ['地推', '传单', '活动', '介绍', '听说', '路过', '抖音', '朋友圈', '其他'], default: '其他' },
    description: { type: String },

    // 其他信息
    isActive: { type: Boolean, default: true },


    createBy: { type: ObjectId, ref: 'User' }, // 创建人
    updateBy: { type: ObjectId, ref: 'User' }, // 创建人

    Org: { type: ObjectId, ref: 'Org' }, // 机构ID，冗余字段，方便查询  
};
const docSchema = new Schema(StudentDOC, { timestamps: true });

docSchema.index({ identity: 1 });

StudentModel = mongoose.model('Student', docSchema);

module.exports = { StudentModel, StudentEnums, StudentDOC };