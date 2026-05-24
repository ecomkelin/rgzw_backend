const StudentMD = require('@models/school/student/Student.model');
const { formatOptions } = require('@utils/formatOptions');
const { deleteImmutableFront } = require('@utils/validatorModel');

class StudentSV {
  async list(query = {}, payload = {}) {
    try {
      const { pageSize, skip, sort } = formatOptions(query.options);
      delete query.options;

      // 如果 regExp = "" 为否
      if (query.regExp) {
        query.displayName = { $regex: query.regExp, $options: 'i' };
      }
      delete query.regExp;

      // 权限控制：isAdmin=true 的用户可以查看所有，roleTemp='manager' 只能查看本公司
      if (!payload.isAdmin) {
        if (payload.currentUser.roleTemp === 'manager') {
          query.Org = payload.currentUser?.Org; // 经理只能查看自己公司的学生
        } else {
          throw new Error("没有权限查看学生列表");
        }
      }

      const items = await StudentMD
        .find(query)
        .populate('Account', 'code name phone isActive isAdmin')
        .populate('Org', 'name isMain')
        .sort(sort)
        .limit(pageSize).skip(skip)

      return { items, query };
    } catch (error) {
      console.error('StudentSV list error:', error.message);
      throw error;
    }
  }

  async detail(_id, payload) {
    try {
      const item = await StudentMD.findById(_id)
        .populate('Account', 'code name phone isActive isAdmin')
        .populate('Org', 'name isMain');

      if (!item) {
        throw new Error("此数据已不存在");
      }

      // 权限控制：isAdmin=true 可以查看任意学生，roleTemp='manager' 只能查看本公司学生
      if (!payload.isAdmin) {
        if (payload.currentUser.roleTemp === 'manager' && item.Org.toString() !== payload.currentUser?.Org.toString()) {
          throw new Error("没有权限查看其他公司的学生");
        } else {
          throw new Error("没有权限查看学生信息");
        }
      }

      return { item };
    } catch (error) {
      console.error('StudentSV detail error:', error.message);
      throw error;
    }
  }

  async create(doc, payload) {
    try {
      // 权限验证：isAdmin=true 和 roleTemp='manager' 都可以创建学生 设置学生的Org
      if (!payload.isAdmin) {
        if (payload.currentUser.roleTemp === 'manager') {
          doc.Org = payload.currentUser?.Org;
        } else {
          throw new Error("没有权限创建学生");
        }
      } else {
        if (!doc.Org) {
          doc.Org = payload.currentUser?.Org;
        }
      }

      deleteImmutableFront(doc, StudentMD.doc);
      doc.createdBy = payload.currentUser?._id;

      const item = new StudentMD(doc);
      await item.save();

      // 返回时填充相关数据
      const populatedItem = await StudentMD.findById(item._id)
        .populate('Account', 'code name phone isActive isAdmin')
        .populate('Org', 'name isMain');

      return { item: populatedItem };
    }
    catch (error) {
      console.error('StudentSV create error:', error.message);
      throw error;
    }
  }

  async update(_id, doc, payload) {
    try {
      // 权限验证：isAdmin=true 可以更新任意学生，roleTemp='manager' 只能更新本公司学生
      const targetStudent = await StudentMD.findById(_id);
      if (!targetStudent) {
        throw new Error('学生不存在');
      }

      if (!payload.isAdmin) {
        delete doc.isActive; // 经理不能修改用户的激活状态
        delete doc.Org; // 经理不能修改用户的组织归属

        if (payload.currentUser.roleTemp === 'manager' && targetStudent.Org.toString() !== payload.currentUser?.Org.toString()) {
          throw new Error("没有权限更新其他公司的学生");
        } else {
          throw new Error("没有权限更新学生");
        }
      }

      // 不允许修改某些关键字段
      delete doc.Account; // 不允许更换账户
      delete doc.Org;     // 不允许更换组织

      deleteImmutableFront(doc, StudentMD.doc);
      doc.updatedBy = payload._id;

      const item = Object.assign(targetStudent, doc);
      await item.save();

      // 返回时填充相关数据
      const populatedItem = await StudentMD.findById(item._id)
        .populate('Account', 'code name phone isActive isAdmin')
        .populate('Org', 'name isMain');

      return { item: populatedItem };
    } catch (error) {
      console.error('StudentSV update error:', error.message);
      throw error;
    }
  }


  async selfUpdate(doc, payload) {
    try {
      delete doc._id;
      for (const key in StudentMD.doc) {
        const field = StudentMD.doc[key];
        if (field.immutableFront === true) delete doc[key]
      }

      // 对于学生模块的selfUpdate，我们假设这是由关联的账户发起的
      // 但是按照当前的需求，学生模块的selfUpdate实际上不太适用
      // 暂时保留框架，但可能会在实际使用中抛出错误
      throw new Error("学生模块暂不支持自我更新功能");
    } catch (error) {
      console.error('StudentSV selfUpdate error:', error.message);
      throw error;
    }
  }
}

module.exports = new StudentSV();