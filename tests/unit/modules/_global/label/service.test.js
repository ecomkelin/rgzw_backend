const LabelSV = require('@modules/_global/label/service');
const LabelMD = require('@models/global/Label.model');
const mongoose = require('mongoose');

// Mock payload 对象
const mockPayload = {
  _id: new mongoose.Types.ObjectId(),
  Org_id: new mongoose.Types.ObjectId(),
  isAdmin: false,
  roleTemp: 'staff'
};

describe('Label Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list method', () => {
    it('should return paginated list of labels for user\'s organization', async () => {
      const mockQuery = { options: { page: 1, limit: 10 } };
      const mockLabels = [{ name: 'Test Label', Org: mockPayload.Org_id }];

      const mockFormattedOptions = {
        pageSize: 10,
        skip: 0,
        sort: { createdAt: -1 }
      };

      // Mock formatOptions utility
      jest.mock('@utils/formatOptions', () => ({
        formatOptions: jest.fn().mockReturnValue(mockFormattedOptions)
      }));

      // Mock the Label model
      LabelMD.find = jest.fn().mockReturnThis();
      LabelMD.populate = jest.fn().mockReturnThis();
      LabelMD.sort = jest.fn().mockReturnThis();
      LabelMD.limit = jest.fn().mockReturnThis();
      LabelMD.skip = jest.fn().mockResolvedValue(mockLabels);
      LabelMD.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await LabelSV.list(mockQuery, mockPayload);

      expect(LabelMD.find).toHaveBeenCalledWith(
        expect.objectContaining({
          Org: mockPayload.Org_id,
          mould: LabelMD.mouldEnums[0]
        })
      );
      expect(result.items).toEqual(mockLabels);
      expect(result.pagination.totalCount).toBe(1);
    });

    it('should return all labels for admin user', async () => {
      const adminPayload = { ...mockPayload, isAdmin: true };
      const mockQuery = { options: { page: 1, limit: 10 } };
      const mockLabels = [{ name: 'Admin Label' }];

      const mockFormattedOptions = {
        pageSize: 10,
        skip: 0,
        sort: { createdAt: -1 }
      };

      jest.mock('@utils/formatOptions', () => ({
        formatOptions: jest.fn().mockReturnValue(mockFormattedOptions)
      }));

      LabelMD.find = jest.fn().mockReturnThis();
      LabelMD.populate = jest.fn().mockReturnThis();
      LabelMD.sort = jest.fn().mockReturnThis();
      LabelMD.limit = jest.fn().mockReturnThis();
      LabelMD.skip = jest.fn().mockResolvedValue(mockLabels);
      LabelMD.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await LabelSV.list(mockQuery, adminPayload);

      expect(LabelMD.find).toHaveBeenCalledWith(
        expect.objectContaining({
          mould: LabelMD.mouldEnums[0]
        })
      ); // Should not filter by Org for admin
    });
  });

  describe('detail method', () => {
    it('should return label details if user has access', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockLabel = {
        _id: mockId,
        name: 'Test Label',
        Org: mockPayload.Org_id
      };

      LabelMD.findById = jest.fn().mockReturnThis();
      LabelMD.populate = jest.fn().mockReturnThis();
      LabelMD.exec = jest.fn().mockResolvedValue(mockLabel);

      const result = await LabelSV.detail(mockId, mockPayload);

      expect(result.item).toEqual(mockLabel);
      expect(LabelMD.findById).toHaveBeenCalledWith(mockId);
    });

    it('should throw error if label does not exist', async () => {
      const mockId = new mongoose.Types.ObjectId();

      LabelMD.findById = jest.fn().mockReturnThis();
      LabelMD.populate = jest.fn().mockReturnThis();
      LabelMD.exec = jest.fn().mockResolvedValue(null);

      await expect(LabelSV.detail(mockId, mockPayload)).rejects.toThrow("此数据已不存在");
    });

    it('should throw error if user does not have access to the label', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const otherOrgId = new mongoose.Types.ObjectId();
      const mockLabel = {
        _id: mockId,
        name: 'Test Label',
        Org: otherOrgId // Different organization
      };

      LabelMD.findById = jest.fn().mockReturnThis();
      LabelMD.populate = jest.fn().mockReturnThis();
      LabelMD.exec = jest.fn().mockResolvedValue(mockLabel);

      await expect(LabelSV.detail(mockId, mockPayload)).rejects.toThrow("您无权查看其他公司的数据");
    });
  });

  describe('create method', () => {
    it('should create a new label with proper associations', async () => {
      const mockInput = { name: 'New Label', mould: 'Subject' };
      const mockCreatedLabel = {
        _id: new mongoose.Types.ObjectId(),
        ...mockInput,
        Org: mockPayload.Org_id,
        createdBy: mockPayload._id
      };

      const mockSavedLabel = {
        ...mockCreatedLabel,
        save: jest.fn().mockResolvedValue(mockCreatedLabel)
      };

      LabelMD = jest.fn().mockImplementation((doc) => ({
        ...doc,
        save: jest.fn().mockResolvedValue(mockCreatedLabel)
      }));

      // We need to mock the constructor
      jest.spyOn(LabelMD, 'constructor').mockImplementation((doc) => new LabelMD(doc));

      // Mock populate after save
      LabelMD.findById = jest.fn().mockReturnThis();
      LabelMD.populate = jest.fn().mockReturnThis();
      LabelMD.exec = jest.fn().mockResolvedValue(mockCreatedLabel);

      // Use jest.fn() to create a new mock function for the constructor
      const mockLabelConstructor = jest.fn().mockImplementation((doc) => {
        return { ...doc, save: jest.fn().mockResolvedValue(mockCreatedLabel) };
      });

      // Replace the constructor temporarily
      const originalConstructor = global.LabelMD;
      global.LabelMD = mockLabelConstructor;

      const result = await LabelSV.create(mockInput, mockPayload);

      expect(result.item).toBeDefined();
    });
  });

  describe('update method', () => {
    it('should update label if user has permission', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockUpdate = { name: 'Updated Name' };
      const mockLabel = {
        _id: mockId,
        name: 'Old Name',
        Org: mockPayload.Org_id,
        save: jest.fn().mockResolvedValue({ ...mockUpdate, _id: mockId })
      };

      LabelMD.findById = jest.fn().mockResolvedValue(mockLabel);

      const result = await LabelSV.update(mockId, mockUpdate, mockPayload);

      expect(LabelMD.findById).toHaveBeenCalledWith(mockId);
      expect(mockLabel.save).toHaveBeenCalled();
    });

    it('should throw error if label does not exist', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockUpdate = { name: 'Updated Name' };

      LabelMD.findById = jest.fn().mockResolvedValue(null);

      await expect(LabelSV.update(mockId, mockUpdate, mockPayload)).rejects.toThrow('标签不存在');
    });
  });

  describe('delete method', () => {
    it('should perform soft delete when soft flag is true', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockLabel = {
        _id: mockId,
        Org: mockPayload.Org_id,
        isActive: true
      };

      const mockUpdatedLabel = { ...mockLabel, isActive: false };

      LabelMD.findOneAndUpdate = jest.fn().mockReturnThis();
      LabelMD.populate = jest.fn().mockReturnThis();
      LabelMD.exec = jest.fn().mockResolvedValue(mockUpdatedLabel);

      const result = await LabelSV.delete(mockId, mockPayload, true);

      expect(LabelMD.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockId, Org: mockPayload.Org_id },
        expect.objectContaining({
          isActive: false,
          updatedBy: mockPayload._id
        }),
        { new: true }
      );
      expect(result.deleted).toBe(true);
    });

    it('should perform hard delete when soft flag is false', async () => {
      const mockId = new mongoose.Types.ObjectId();

      LabelMD.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

      const result = await LabelSV.delete(mockId, mockPayload, false);

      expect(LabelMD.deleteOne).toHaveBeenCalledWith({ _id: mockId, Org: mockPayload.Org_id });
      expect(result.deleteInfo.deletedCount).toBe(1);
    });
  });

  describe('deleteMany method', () => {
    it('should throw error if ids is not an array', async () => {
      await expect(LabelSV.deleteMany({}, mockPayload, false)).rejects.toThrow("ids必须是数组");
    });

    it('should perform bulk soft delete when soft flag is true', async () => {
      const mockIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const mockQuery = { ids: mockIds };

      LabelMD.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 2, matchedCount: 2 });

      const result = await LabelSV.deleteMany(mockQuery, mockPayload, true);

      expect(LabelMD.updateMany).toHaveBeenCalledWith(
        {
          _id: { $in: mockIds },
          Org: mockPayload.Org_id
        },
        expect.objectContaining({
          isActive: false,
          updatedBy: mockPayload._id
        })
      );
      expect(result.updatedCount).toBe(2);
    });
  });
});