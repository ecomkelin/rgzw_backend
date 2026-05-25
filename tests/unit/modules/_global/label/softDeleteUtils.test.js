const {
  restoreDeletedLabel,
  permanentDeleteLabel,
  getDeletedLabels
} = require('@modules/_global/label/utils/softDeleteUtils');
const LabelMD = require('@models/global/Label.model');
const mongoose = require('mongoose');

// Mock payload
const mockPayload = {
  _id: new mongoose.Types.ObjectId(),
  Org_id: new mongoose.Types.ObjectId(),
  isAdmin: false
};

describe('Label Soft Delete Utils Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('restoreDeletedLabel', () => {
    it('should restore a soft-deleted label', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockRestoredLabel = {
        _id: mockId,
        name: 'Restored Label',
        isActive: true,
        Org: mockPayload.Org_id
      };

      LabelMD.findOneAndUpdate = jest.fn().mockReturnThis();
      LabelMD.populate = jest.fn().mockReturnThis();
      LabelMD.exec = jest.fn().mockResolvedValue(mockRestoredLabel);

      const result = await restoreDeletedLabel(mockId, mockPayload);

      expect(LabelMD.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: mockId,
          Org: mockPayload.Org_id,
          isActive: false
        },
        {
          isActive: true,
          updatedBy: mockPayload._id,
          deletedAt: null
        },
        { new: true }
      );
      expect(result.restored).toBe(true);
      expect(result.item).toEqual(mockRestoredLabel);
    });

    it('should return message when label does not exist or cannot be restored', async () => {
      const mockId = new mongoose.Types.ObjectId();

      LabelMD.findOneAndUpdate = jest.fn().mockReturnThis();
      LabelMD.populate = jest.fn().mockReturnThis();
      LabelMD.exec = jest.fn().mockResolvedValue(null);

      const result = await restoreDeletedLabel(mockId, mockPayload);

      expect(result.restored).toBe(false);
      expect(result.message).toContain('标签不存在、不属于您的组织或未被删除');
    });
  });

  describe('permanentDeleteLabel', () => {
    it('should permanently delete a soft-deleted label', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockDeleteResult = { deletedCount: 1 };

      LabelMD.deleteOne = jest.fn().mockResolvedValue(mockDeleteResult);

      const result = await permanentDeleteLabel(mockId, mockPayload);

      expect(LabelMD.deleteOne).toHaveBeenCalledWith({
        _id: mockId,
        Org: mockPayload.Org_id,
        isActive: false
      });
      expect(result.deleted).toBe(true);
      expect(result.message).toBe('标签已永久删除');
    });

    it('should return message when label cannot be permanently deleted', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockDeleteResult = { deletedCount: 0 };

      LabelMD.deleteOne = jest.fn().mockResolvedValue(mockDeleteResult);

      const result = await permanentDeleteLabel(mockId, mockPayload);

      expect(result.deleted).toBe(false);
      expect(result.message).toBe('标签不存在、不属于您的组织或尚未被软删除');
    });
  });

  describe('getDeletedLabels', () => {
    it('should return list of soft-deleted labels', async () => {
      const mockDeletedLabels = [
        { name: 'Deleted Label 1', isActive: false },
        { name: 'Deleted Label 2', isActive: false }
      ];
      const mockOptions = { page: 1, limit: 10 };


      LabelMD.find = jest.fn().mockReturnThis();
      LabelMD.populate = jest.fn().mockReturnThis();
      LabelMD.sort = jest.fn().mockReturnThis();
      LabelMD.limit = jest.fn().mockReturnThis();
      LabelMD.skip = jest.fn().mockResolvedValue(mockDeletedLabels);
      LabelMD.countDocuments = jest.fn().mockResolvedValue(2);

      const result = await getDeletedLabels(mockPayload, mockOptions);

      expect(LabelMD.find).toHaveBeenCalledWith({
        Org: mockPayload.Org_id,
        isActive: false
      });
      expect(result.items).toEqual(mockDeletedLabels);
      expect(result.pagination.totalCount).toBe(2);
    });

    it('should filter by mould if provided', async () => {
      const mockOptions = { mould: 'Subject', page: 1, limit: 10 };
      const mockDeletedLabels = [{ name: 'Subject Label', mould: 'Subject', isActive: false }];

      LabelMD.find = jest.fn().mockReturnThis();
      LabelMD.populate = jest.fn().mockReturnThis();
      LabelMD.sort = jest.fn().mockReturnThis();
      LabelMD.limit = jest.fn().mockReturnThis();
      LabelMD.skip = jest.fn().mockResolvedValue(mockDeletedLabels);
      LabelMD.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await getDeletedLabels(mockPayload, mockOptions);

      expect(LabelMD.find).toHaveBeenCalledWith({
        Org: mockPayload.Org_id,
        isActive: false,
        mould: 'Subject'
      });
      expect(result.items).toEqual(mockDeletedLabels);
    });
  });
});