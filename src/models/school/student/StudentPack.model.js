const StudentPackageDOC = {
  // ==================== 归属 ====================
  Account: { type: ObjectId, ref: 'Account', required: true },  // 家长
  Student: { type: ObjectId, ref: 'Student', required: true },  // 学生（必填，课时仅限该生使用）
  Order: { type: ObjectId, ref: 'OrderPack', required: true },     // 来源订单

  // ==================== 课包内容 ====================
  Pack: { type: ObjectId, ref: 'Pack' },
  packName: { type: String },
  subjectScope: { type: String },                               // 可用科目范围描述（从Pack带过来）
  totalLesson: { type: Number, required: true },
  usedLesson: { type: Number, default: 0 },
  remainingLesson: { type: Number, required: true },

  // ==================== 有效期 ====================
  activeDate: { type: Date, default: Date.now },                // 激活日期
  expireDate: { type: Date },

  // ==================== 状态 ====================
  status: { type: String, enum: ['active', 'frozen', 'exhausted', 'refunded'], default: 'active' },

  // ==================== 审计 ====================
  Org: { type: ObjectId, ref: 'Org', required: true },
  createdBy: { type: ObjectId, ref: 'User', immutable: true },
  updatedBy: { type: ObjectId, ref: 'User' }
};

const studentPackageSchema = new Schema(StudentPackageDOC, { timestamps: true });
studentPackageSchema.index({ Student: 1, status: 1 });
studentPackageSchema.index({ Account: 1 });