/**
 * Label 控制器单元测试
 *
 * 本测试文件验证 Label 模块控制器层的所有端点方法
 * 测试包括：list, detail, create, update, delete, deleteIds 方法
 * 验证控制器对服务层的调用和响应格式
 *
 * 测试要点：
 * - 控制器方法的正确调用
 * - HTTP 响应状态码
 * - 成功和错误情况的处理
 * - 错误响应格式的一致性
 */

const LabelCT = require('@modules/_global/label/controller');
const LabelSV = require('@modules/_global/label/service');
const ApiResponse = require('@utils/response');
const mongoose = require('mongoose');

// Mock payload
const mockPayload = {
  _id: new mongoose.Types.ObjectId(),
  Org_id: new mongoose.Types.ObjectId(),
  isAdmin: false,
  roleTemp: 'staff'
};

// Mock response object
const createMockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

describe('Label Controller Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list method', () => {
    it('should return success response with label list', async () => {
      const mockReq = {
        validData: { options: { page: 1, limit: 10 } },
        payload: mockPayload
      };
      const mockRes = createMockRes();
      const mockServiceResult = {
        items: [{ name: 'Test Label' }],
        query: {},
        pagination: { currentPage: 1, pageSize: 10, totalCount: 1, totalPages: 1 }
      };

      jest.spyOn(LabelSV, 'list').mockResolvedValue(mockServiceResult);

      await LabelCT.list(mockReq, mockRes);

      expect(LabelSV.list).toHaveBeenCalledWith(mockReq.validData, mockReq.payload);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        ApiResponse.success({
          data: {
            items: mockServiceResult.items,
            query: mockServiceResult.query,
            pagination: mockServiceResult.pagination
          }
        })
      );
    });

    it('should return server error response when service throws error', async () => {
      const mockReq = {
        validData: { options: { page: 1, limit: 10 } },
        payload: mockPayload
      };
      const mockRes = createMockRes();

      jest.spyOn(LabelSV, 'list').mockRejectedValue(new Error('Database error'));

      await LabelCT.list(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(ApiResponse.error({code: 500}));
    });
  });

  describe('detail method', () => {
    it('should return label details', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockReq = {
        params: { id: mockId.toString() },
        payload: mockPayload
      };
      const mockRes = createMockRes();
      const mockServiceResult = { item: { _id: mockId, name: 'Test Label' } };

      jest.spyOn(LabelSV, 'detail').mockResolvedValue(mockServiceResult);

      await LabelCT.detail(mockReq, mockRes);

      expect(LabelSV.detail).toHaveBeenCalledWith(mockReq.params.id, mockReq.payload);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        ApiResponse.success(mockServiceResult.item)
      );
    });

    it('should return not found error when label does not exist', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockReq = {
        params: { id: mockId.toString() },
        payload: mockPayload
      };
      const mockRes = createMockRes();

      jest.spyOn(LabelSV, 'detail').mockRejectedValue(new Error('此数据已不存在'));

      await LabelCT.detail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        ApiResponse.notFoundError('标签不存在')
      );
    });

    it('should return forbidden error when user has no access', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockReq = {
        params: { id: mockId.toString() },
        payload: mockPayload
      };
      const mockRes = createMockRes();

      jest.spyOn(LabelSV, 'detail').mockRejectedValue(new Error('您无权查看其他公司的数据'));

      await LabelCT.detail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        ApiResponse.forbiddenError('无权访问该标签')
      );
    });
  });

  describe('create method', () => {
    it('should create label and return success response', async () => {
      const mockReq = {
        validData: { name: 'New Label', mould: 'Subject' },
        payload: mockPayload
      };
      const mockRes = createMockRes();
      const mockServiceResult = { item: { name: 'New Label', mould: 'Subject' } };

      jest.spyOn(LabelSV, 'create').mockResolvedValue(mockServiceResult);

      await LabelCT.create(mockReq, mockRes);

      expect(LabelSV.create).toHaveBeenCalledWith(mockReq.validData, mockReq.payload);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        ApiResponse.success(mockServiceResult.item)
      );
    });

    it('should return conflict error when label name already exists', async () => {
      const mockReq = {
        validData: { name: 'Existing Label', mould: 'Subject' },
        payload: mockPayload
      };
      const mockRes = createMockRes();

      jest.spyOn(LabelSV, 'create').mockRejectedValue({ code: 11000 });

      await LabelCT.create(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith(
        ApiResponse.error('标签名称已存在')
      );
    });
  });

  describe('update method', () => {
    it('should update label and return success response', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockReq = {
        params: { id: mockId.toString() },
        validData: { name: 'Updated Label' },
        payload: mockPayload
      };
      const mockRes = createMockRes();
      const mockServiceResult = { item: { name: 'Updated Label' } };

      jest.spyOn(LabelSV, 'update').mockResolvedValue(mockServiceResult);

      await LabelCT.update(mockReq, mockRes);

      expect(LabelSV.update).toHaveBeenCalledWith(mockReq.params.id, mockReq.validData, mockReq.payload);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        ApiResponse.success(mockServiceResult.item)
      );
    });

    it('should return not found error when label does not exist', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockReq = {
        params: { id: mockId.toString() },
        validData: { name: 'Updated Label' },
        payload: mockPayload
      };
      const mockRes = createMockRes();

      jest.spyOn(LabelSV, 'update').mockRejectedValue(new Error('标签不存在'));

      await LabelCT.update(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        ApiResponse.notFoundError('标签不存在')
      );
    });
  });

  describe('delete method', () => {
    it('should delete label and return success response', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockReq = {
        params: { id: mockId.toString() },
        payload: mockPayload,
        query: {}
      };
      const mockRes = createMockRes();
      const mockServiceResult = { item: { name: 'Deleted Label' } };

      jest.spyOn(LabelSV, 'delete').mockResolvedValue(mockServiceResult);

      await LabelCT.delete(mockReq, mockRes);

      expect(LabelSV.delete).toHaveBeenCalledWith(mockReq.params.id, mockReq.payload, false);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        ApiResponse.success(mockServiceResult.item)
      );
    });

    it('should handle soft delete when softDelete param is true', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockReq = {
        params: { id: mockId.toString() },
        payload: mockPayload,
        query: { softDelete: 'true' }
      };
      const mockRes = createMockRes();
      const mockServiceResult = { item: { name: 'Soft Deleted Label' } };

      jest.spyOn(LabelSV, 'delete').mockResolvedValue(mockServiceResult);

      await LabelCT.delete(mockReq, mockRes);

      expect(LabelSV.delete).toHaveBeenCalledWith(mockReq.params.id, mockReq.payload, true);
    });
  });

  describe('deleteIds method', () => {
    it('should delete multiple labels and return success response', async () => {
      const mockReq = {
        validData: { ids: [new mongoose.Types.ObjectId()] },
        payload: mockPayload,
        query: {}
      };
      const mockRes = createMockRes();
      const mockServiceResult = { deletedCount: 1 };

      jest.spyOn(LabelSV, 'deleteMany').mockResolvedValue(mockServiceResult);

      await LabelCT.deleteIds(mockReq, mockRes);

      expect(LabelSV.deleteMany).toHaveBeenCalledWith(mockReq.validData, mockReq.payload, false);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        ApiResponse.success(mockServiceResult)
      );
    });

    it('should return bad request error when ids is invalid', async () => {
      const mockReq = {
        validData: { ids: 'invalid' },
        payload: mockPayload,
        query: {}
      };
      const mockRes = createMockRes();

      jest.spyOn(LabelSV, 'deleteMany').mockRejectedValue(new Error('ids必须是数组'));

      await LabelCT.deleteIds(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        ApiResponse.badRequestError('ids必须是数组')
      );
    });
  });
});