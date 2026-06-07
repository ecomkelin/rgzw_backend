const { StudentPackDAO, StudentPackDOC } = require('@models/school/student/StudentPack.dao');
const { deleteImmutableFront } = require('@/utils/fieldAttributes');

/**
 * StudentPack 业务服务
 *
 * Service 层职责:
 * 1. 删除前端不可变字段 (immutable / immutableFront)
 * 2. 透传到 DAO 处理
 *
 * 注意: StudentPack 的真正创建入口有两个
 *  - OrderPack 来源: 由 OrderPack.dao.add 内部调用 StudentPackDAO.createFromOrderPack
 *  - free 赠送    : 本服务 add 方法, 仅超管
 */
class StudentPackSV {
  /**
   * 列表
   */
  async list(payload, filter = {}, options) {
    try {
      const { items, total } = await StudentPackDAO.list(payload, filter, options);
      return { items, total };
    } catch (e) {
      console.error('StudentPackSV list error:', e);
      throw e;
    }
  }

  /**
   * 详情
   */
  async detail(payload, _id, options) {
    try {
      const { item } = await StudentPackDAO.detail(payload, _id, options);
      if (!item) {
        throw ({ code: 404, message: '此 学生课包 数据已不存在' });
      }
      return { item };
    } catch (e) {
      console.error('StudentPackSV detail error:', e);
      throw e;
    }
  }

  /**
   * 手动添加 (仅 free 赠送, 仅超管)
   */
  async add(payload, doc, options) {
    try {
      // 删除不可变字段 (DAO 内部会重新注入)
      deleteImmutableFront(doc, StudentPackDOC);
      // 同时显式删除 schema 上标 immutable 的字段 (OrderPack / Account / Org / Student / Pack / resource)
      delete doc.OrderPack;
      delete doc.Account;
      delete doc.Org;
      delete doc.Pack;
      delete doc.resource;
      delete doc.createdBy;
      delete doc.LessonAttendances;

      const { item } = await StudentPackDAO.add(payload, doc, options);
      return { item };
    } catch (e) {
      console.error('StudentPackSV add error:', e);
      throw e;
    }
  }

  /**
   * 编辑 (仅超管)
   */
  async edit(payload, _id, doc, options) {
    try {
      deleteImmutableFront(doc, StudentPackDOC);
      // 删除 schema 上不可变 / 禁改的字段
      delete doc.OrderPack;
      delete doc.Account;
      delete doc.Org;
      delete doc.Student;
      delete doc.Pack;
      delete doc.resource;
      delete doc.totalLesson;
      delete doc.packName;
      delete doc.LessonAttendances;
      delete doc.createdBy;

      const { item } = await StudentPackDAO.edit(payload, _id, doc, options);
      return { item };
    } catch (e) {
      console.error('StudentPackSV edit error:', e);
      throw e;
    }
  }
}

module.exports = new StudentPackSV();
