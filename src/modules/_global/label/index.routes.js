const express = require('express');
const router = express.Router();
const LabelCT = require('./controller');
const { authenticate } = require('../../../middlewares/auth');
const { createVD, updateVD, listVD, detailVD, deleteVD, deleteIdsVD } = require('./middlewares/validator');
const { readPermission, createPermission, editPermission, deletePermission } = require('./middlewares/permission');
const { softDeleteMiddleware } = require('./middlewares/softDelete');

// 获取列表和详情
router.post('/list', authenticate, readPermission, listVD, LabelCT.list);
router.get('/:id', authenticate, readPermission, detailVD, LabelCT.detail);

// 创建
router.post('/create', authenticate, createPermission, createVD, LabelCT.create);

// 修改
router.put('/:id', authenticate, editPermission, updateVD, LabelCT.update);

// 删除（支持软删除）
router.delete('/:id', authenticate, deletePermission, deleteVD, softDeleteMiddleware, LabelCT.delete);
router.post('/deleteIds', authenticate, deletePermission, deleteIdsVD, softDeleteMiddleware, LabelCT.deleteIds);

// 特殊路由：恢复已删除的标签
router.post('/restore/:id', authenticate, editPermission, detailVD, async (req, res) => {
  try {
    const softDeleteUtils = require('./utils/softDeleteUtils');
    const result = await softDeleteUtils.restoreDeletedLabel(req.params.id, req.payload);
    const ApiResponse = require('../../../utils/response');
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    console.error("Label restore error: ", error.message);
    const ApiResponse = require('../../../utils/response');
    return res.status(500).json(ApiResponse.serverError());
  }
});

// 特殊路由：永久删除已标记为删除的标签
router.delete('/permanent/:id', authenticate, deletePermission, detailVD, async (req, res) => {
  try {
    const softDeleteUtils = require('./utils/softDeleteUtils');
    const result = await softDeleteUtils.permanentDeleteLabel(req.params.id, req.payload);
    const ApiResponse = require('../../../utils/response');
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    console.error("Label permanent delete error: ", error.message);
    const ApiResponse = require('../../../utils/response');
    return res.status(500).json(ApiResponse.serverError());
  }
});

// 特殊路由：获取已删除的标签列表
router.post('/deleted-list', authenticate, readPermission, listVD, async (req, res) => {
  try {
    const softDeleteUtils = require('./utils/softDeleteUtils');
    const result = await softDeleteUtils.getDeletedLabels(req.payload, req.validData.options || {});
    const ApiResponse = require('../../../utils/response');
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    console.error("Label get deleted list error: ", error.message);
    const ApiResponse = require('../../../utils/response');
    return res.status(500).json(ApiResponse.serverError());
  }
});

module.exports = router;