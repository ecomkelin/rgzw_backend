const { StudentCourseDAO, StudentCourseDOC } = require('@models/school/student/StudentCourse.dao');
const { deleteImmutableFront } = require('@/utils/fieldAttributes');

/**
 * StudentCourse 业务服务
 *
 * Service 层职责:
 * 1. 删除前端不可变字段 (immutable / immutableFront)
 * 2. 透传到 DAO 处理
 *
 * 业务背景:
 *  - 学生确认上课后, 管理员手动 add 选课记录
 *  - add 时 StudentPack 可选, 后续 edit 可绑定/更换
 *  - Student / Course / Account / Org / nameCourse / createdBy 全部由 DAO 强制注入
 */
class StudentCourseSV {
  /**
   * 列表
   */
  async list(payload, filter = {}, options) {
    try {
      const { items, total } = await StudentCourseDAO.list(payload, filter, options);
      return { items, total };
    } catch (e) {
      console.error('StudentCourseSV list error:', e);
      throw e;
    }
  }

  /**
   * 详情
   */
  async detail(payload, _id, options) {
    try {
      const { item } = await StudentCourseDAO.detail(payload, _id, options);
      if (!item) {
        throw ({ code: 404, message: '此 学生选课 数据已不存在' });
      }
      return { item };
    } catch (e) {
      console.error('StudentCourseSV detail error:', e);
      throw e;
    }
  }

  /**
   * 手动添加 (学生确认上课后, 管理员填写)
   */
  async add(payload, doc, options) {
    try {
      // 1. 删除前端不可变字段 (DAO 会重新注入)
      deleteImmutableFront(doc, StudentCourseDOC);
      // 2. 显式删除 immutable 字段, 防止前端误传
      delete doc.Student;        // 由 validator 保证必填, 后续 DAO 不依赖此值, 但保留也无妨
      delete doc.Account;
      delete doc.Course;
      delete doc.Org;
      delete doc.createdBy;
      delete doc.nameCourse;
      delete doc.updatedBy;

      const { item } = await StudentCourseDAO.add(payload, doc, options);
      return { item };
    } catch (e) {
      console.error('StudentCourseSV add error:', e);
      throw e;
    }
  }

  /**
   * 编辑 (调整 StudentPack / status / remark 等)
   */
  async edit(payload, _id, doc, options) {
    try {
      // 1. 删除前端不可变字段
      deleteImmutableFront(doc, StudentCourseDOC);
      // 2. 显式删除 immutable 字段
      delete doc.Student;
      delete doc.Account;
      delete doc.Course;
      delete doc.Org;
      delete doc.nameCourse;
      delete doc.createdBy;
      // updatedBy 留作可改, 但由 DAO 重新注入

      const { item } = await StudentCourseDAO.edit(payload, _id, doc, options);
      return { item };
    } catch (e) {
      console.error('StudentCourseSV edit error:', e);
      throw e;
    }
  }
}

module.exports = new StudentCourseSV();
