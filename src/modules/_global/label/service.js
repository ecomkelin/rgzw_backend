const LabelMD = require('@models/global/Label.model');
const { formatOptions } = require('@utils/formatOptions');

const { mouldEnums } = LabelMD

class LabelSV {
  async list(query = {}, payload) {
    try {
      const { pageSize, skip, sort } = formatOptions(query.options);
      delete query.options;

      // 优化正则搜索
      if (query.regExp && query.regExp.trim() !== '') {
        query.name = { $regex: query.regExp, $options: 'i' }; // 不区分大小写的搜索
      }
      delete query.regExp;

      if (!payload.isAdmin) query.Org = payload.Org_id;
      if (!query.mould) query.mould = mouldEnums[0];

      if (!payload.isAdmin || payload.roleSimp !== 'manager') {
        query.isActive = true;
      }

      const items = await LabelMD
        .find(query)
        .populate('createdBy', 'username email') // 根据需要填充关联字段
        .sort(sort)
        .limit(pageSize).skip(skip)

      // 获取总数量用于分页
      const totalCount = await LabelMD.countDocuments(query);

      return {
        items,
        query,
        pagination: {
          currentPage: Math.floor(skip / pageSize) + 1,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      };
    } catch (error) {
      console.error('LabelSV list error:', error.message);
      throw error;
    }
  }
  async detail(_id, payload) {
    try {
      const item = await LabelMD.findById(_id)
        .populate('createdBy', 'username email')
        .populate('updatedBy', 'username email');

      if (!item) {
        throw new Error("此数据已不存在");
      }
      if (!payload.isAdmin && item.Org.toString() !== payload.Org_id) {
        throw new Error("您无权查看其他公司的数据");
      }
      return { item };
    } catch (error) {
      console.error('LabelSV detail error:', error.message);
      throw error;
    }
  }


  async create(doc, payload) {
    try {
      doc.Org = payload.Org_id;
      doc.createdBy = payload._id;

      const _item = new LabelMD(doc);
      const item = await _item.save();

      // 返回完整填充的信息
      const populatedItem = await LabelMD.findById(item._id)
        .populate('createdBy', 'username email')
        .populate('updatedBy', 'username email');

      return { item: populatedItem };
    } catch (error) {
      console.error('LabelSV create error:', error.message);
      throw error;
    }
  }


  async update(_id, doc, payload) {
    try {
      delete doc._id; // 防止修改 ID
      delete doc.Org; // 防止修改所属组织
      delete doc.module; // 防止修改所属模块
      delete doc.createdAt; // 防止修改创建时间

      const Label = await LabelMD.findById(_id);
      if (!Label) {
        throw new Error('标签不存在');
      }
      if (Label.Org.toString() !== payload.Org_id) {
        throw new Error('无权限操作该标签');
      }

      const item = Object.assign(Label, doc);
      await item.save();

      // 返回完整填充的信息
      const populatedItem = await LabelMD.findById(item._id)
        .populate('createdBy', 'username email')
        .populate('updatedBy', 'username email');

      return { item: populatedItem };

    } catch (error) {
      console.error('LabelSV update error:', error.message);
      throw error;
    }
  }

  async delete(_id, payload, soft = false) {
    try {
      if (soft) {
        // 软删除实现
        const updateQuery = { _id, Org: payload.Org_id };
        const updateData = {
          isActive: false,
          updatedBy: payload._id,
          deletedAt: new Date()
        };
        const updatedItem = await LabelMD.findOneAndUpdate(updateQuery, updateData, { new: true })
          .populate('createdBy', 'username email')
          .populate('updatedBy', 'username email');

        return {
          item: updatedItem,
          deleted: !!updatedItem,
          message: updatedItem ? '标签已标记为删除' : '标签不存在或无权删除'
        };
      } else {
        // 硬删除实现
        const deleteQuery = { _id, Org: payload.Org_id };
        const deleteInfo = await LabelMD.deleteOne(deleteQuery);

        // 返回删除的详细信息
        return {
          deleteInfo,
          deleteQuery,
          deletedId: _id,
          message: deleteInfo.deletedCount > 0 ? '标签删除成功' : '标签不存在或无权删除'
        };
      }
    } catch (error) {
      console.error('LabelSV delete error:', error.message);
      throw error;
    }
  }

  async deleteMany(query = {}, payload, soft = false) {
    try {
      const { ids } = query;
      if (!Array.isArray(ids) || ids.length < 1) {
        throw new Error("LabelSV deleteIds error: ids必须是数组 并且不能为空")
      }
      if (ids.length > 100) { // 防止批量操作过大
        throw new Error("LabelSV deleteIds error: 单次批量删除不能超过100条记录")
      }

      if (soft) {
        // 软删除实现
        const updateQuery = {
          _id: { $in: ids },
          Org: payload.Org_id
        };

        const updateData = {
          isActive: false,
          updatedBy: payload._id,
          deletedAt: new Date()
        };

        const result = await LabelMD.updateMany(updateQuery, updateData);

        return {
          updatedCount: result.modifiedCount,
          matchedCount: result.matchedCount,
          message: `成功软删除了 ${result.modifiedCount} 个标签`
        };
      } else {
        // 硬删除实现
        const deleteQuery = {
          _id: { $in: ids },
          Org: payload.Org_id
        }
        const deleteInfo = await LabelMD.deleteMany(deleteQuery);

        return {
          deleteInfo,
          deleteQuery,
          deletedCount: deleteInfo.deletedCount,
          message: `成功删除了 ${deleteInfo.deletedCount} 个标签`
        };
      }
    } catch (error) {
      console.error('LabelSV deleteIds error:', error.message);
      throw error;
    }
  }

}

module.exports = new LabelSV(); 