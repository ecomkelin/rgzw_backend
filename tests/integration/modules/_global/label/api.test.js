const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('@/main'); // Import app from main
const LabelMD = require('@models/global/Label.model');

// Test data
const testLabel = {
  name: 'Integration Test Label',
  mould: 'Subject',
  description: 'A label for integration testing'
};

describe('Label Module Integration Tests', () => {
  let createdLabelId;
  let authToken; // This would be obtained through a login endpoint in real tests

  beforeAll(async () => {
    // Connect to a test database if needed
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test');
    }
  });

  afterAll(async () => {
    // Clean up created labels
    if (createdLabelId) {
      await LabelMD.findByIdAndDelete(createdLabelId);
    }

    // Close database connection
    await mongoose.connection.close();
  });

  describe('POST /api/label/create', () => {
    it('should create a new label', async () => {
      const response = await request(app)
        .post('/api/label/create')
        .send(testLabel)
        .set('Authorization', `Bearer ${authToken || 'mock-token'}`) // Using mock token for testing
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('item');
      expect(response.body.data.item.name).toBe(testLabel.name);

      createdLabelId = response.body.data.item._id;
    });

    it('should return 409 when label name already exists', async () => {
      const response = await request(app)
        .post('/api/label/create')
        .send(testLabel) // Same name as before
        .set('Authorization', `Bearer ${authToken || 'mock-token'}`)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('标签名称已存在');
    });
  });

  describe('GET /api/label/:id', () => {
    it('should return label details by ID', async () => {
      if (!createdLabelId) {
        // Skip if we didn't create a label in the previous test
        return;
      }

      const response = await request(app)
        .get(`/api/label/${createdLabelId}`)
        .set('Authorization', `Bearer ${authToken || 'mock-token'}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id', createdLabelId);
    });

    it('should return 404 for non-existent label', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/label/${fakeId}`)
        .set('Authorization', `Bearer ${authToken || 'mock-token'}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('标签不存在');
    });
  });

  describe('PUT /api/label/:id', () => {
    it('should update label by ID', async () => {
      if (!createdLabelId) {
        // Skip if we didn't create a label in the previous test
        return;
      }

      const updatedData = {
        name: 'Updated Integration Test Label',
        description: 'Updated description for integration testing'
      };

      const response = await request(app)
        .put(`/api/label/${createdLabelId}`)
        .send(updatedData)
        .set('Authorization', `Bearer ${authToken || 'mock-token'}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('item');
      expect(response.body.data.item.name).toBe(updatedData.name);
    });
  });

  describe('POST /api/label/list', () => {
    it('should return list of labels', async () => {
      const response = await request(app)
        .post('/api/label/list')
        .send({ options: { page: 1, limit: 10 } })
        .set('Authorization', `Bearer ${authToken || 'mock-token'}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });
  });

  describe('DELETE /api/label/:id', () => {
    it('should soft delete label by default', async () => {
      // Create a new label to test deletion
      const newLabelResponse = await request(app)
        .post('/api/label/create')
        .send({...testLabel, name: 'To be Soft Deleted'})
        .set('Authorization', `Bearer ${authToken || 'mock-token'}`)
        .expect(201);

      const labelIdToDelete = newLabelResponse.body.data.item._id;

      const response = await request(app)
        .delete(`/api/label/${labelIdToDelete}`)
        .set('Authorization', `Bearer ${authToken || 'mock-token'}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('item');
    });

    it('should hard delete label when specified', async () => {
      // Create a new label for hard deletion test
      const newLabelResponse = await request(app)
        .post('/api/label/create')
        .send({...testLabel, name: 'To be Hard Deleted'})
        .set('Authorization', `Bearer ${authToken || 'mock-token'}`)
        .expect(201);

      const labelIdToDelete = newLabelResponse.body.data.item._id;

      // Note: The hard delete logic may not exist in the original code, so this is illustrative
      const response = await request(app)
        .delete(`/api/label/${labelIdToDelete}`)
        .query({ hardDelete: true }) // Passing as query parameter
        .set('Authorization', `Bearer ${authToken || 'mock-token'}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/label/deleteIds', () => {
    it('should bulk delete multiple labels', async () => {
      // Create multiple labels for bulk deletion test
      const labelsToCreate = [
        { name: 'Bulk Delete 1', mould: 'Subject' },
        { name: 'Bulk Delete 2', mould: 'Subject' }
      ];

      const createdLabels = [];
      for (const labelData of labelsToCreate) {
        const response = await request(app)
          .post('/api/label/create')
          .send(labelData)
          .set('Authorization', `Bearer ${authToken || 'mock-token'}`)
          .expect(201);

        createdLabels.push(response.body.data.item._id);
      }

      // Bulk delete them
      const response = await request(app)
        .post('/api/label/deleteIds')
        .send({ ids: createdLabels })
        .set('Authorization', `Bearer ${authToken || 'mock-token'}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('deletedCount');
    });
  });

  describe('Soft Delete Specific Endpoints', () => {
    let softDeletedLabelId;

    beforeAll(async () => {
      // Create a label for soft delete testing
      const response = await request(app)
        .post('/api/label/create')
        .send({...testLabel, name: 'Soft Delete Test'})
        .set('Authorization', `Bearer ${authToken || 'mock-token'}`)
        .expect(201);

      softDeletedLabelId = response.body.data.item._id;

      // Now soft delete it
      await request(app)
        .delete(`/api/label/${softDeletedLabelId}`)
        .query({ softDelete: true })
        .set('Authorization', `Bearer ${authToken || 'mock-token'}`)
        .expect(200);
    });

    it('should get list of soft deleted labels', async () => {
      const response = await request(app)
        .post('/api/label/deleted-list')
        .send({ options: { page: 1, limit: 10 } })
        .set('Authorization', `Bearer ${authToken || 'mock-token'}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
    });

    it('should restore a soft deleted label', async () => {
      const response = await request(app)
        .post(`/api/label/restore/${softDeletedLabelId}`)
        .set('Authorization', `Bearer ${authToken || 'mock-token'}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});