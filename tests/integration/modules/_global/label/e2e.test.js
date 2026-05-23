const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('@/main'); // Import app from main
const LabelMD = require('@models/global/Label.model');

describe('Label Module End-to-End Test', () => {
  let testLabelId;
  let authToken = 'mock-token'; // In real scenario, this would be obtained from login

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test-e2e');
    }
  });

  afterAll(async () => {
    // Clean up any created documents
    if (testLabelId) {
      await LabelMD.findByIdAndDelete(testLabelId);
    }

    // Close database connection
    await mongoose.connection.close();
  });

  it('should complete full CRUD cycle for labels', async () => {
    // Step 1: Create a label
    const createResponse = await request(app)
      .post('/api/label/create')
      .send({
        name: 'E2E Test Label',
        mould: 'Subject',
        description: 'A label created for end-to-end testing',
        isActive: true
      })
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);

    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data).toHaveProperty('item');
    expect(createResponse.body.data.item.name).toBe('E2E Test Label');

    testLabelId = createResponse.body.data.item._id;

    // Step 2: Get the created label
    const getResponse = await request(app)
      .get(`/api/label/${testLabelId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(getResponse.body.success).toBe(true);
    expect(getResponse.body.data._id).toBe(testLabelId);
    expect(getResponse.body.data.name).toBe('E2E Test Label');

    // Step 3: Update the label
    const updateResponse = await request(app)
      .put(`/api/label/${testLabelId}`)
      .send({
        name: 'Updated E2E Test Label',
        description: 'Updated description'
      })
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.data).toHaveProperty('item');
    expect(updateResponse.body.data.item.name).toBe('Updated E2E Test Label');

    // Step 4: Get list of labels (should include our updated label)
    const listResponse = await request(app)
      .post('/api/label/list')
      .send({
        options: { page: 1, limit: 10 }
      })
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(listResponse.body.success).toBe(true);
    expect(listResponse.body.data).toHaveProperty('items');
    expect(Array.isArray(listResponse.body.data.items)).toBe(true);

    // Verify that our updated label is in the list
    const updatedLabelInList = listResponse.body.data.items.find(item => item._id === testLabelId);
    expect(updatedLabelInList).toBeDefined();
    expect(updatedLabelInList.name).toBe('Updated E2E Test Label');

    // Step 5: Soft delete the label
    const deleteResponse = await request(app)
      .delete(`/api/label/${testLabelId}`)
      .query({ softDelete: true }) // Use query param for soft delete
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(deleteResponse.body.success).toBe(true);
    expect(deleteResponse.body.data).toHaveProperty('item');
    expect(deleteResponse.body.data.item.isActive).toBe(false);

    // Step 6: Verify the label is marked as deleted
    const afterDeleteResponse = await request(app)
      .get(`/api/label/${testLabelId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404); // Assuming soft-deleted items return 404 for detail

    expect(afterDeleteResponse.body.success).toBe(false);
    expect(afterDeleteResponse.body.message).toBe('标签不存在');

    // Step 7: Restore the soft-deleted label
    const restoreResponse = await request(app)
      .post(`/api/label/restore/${testLabelId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(restoreResponse.body.success).toBe(true);
    expect(restoreResponse.body.data).toHaveProperty('item');
    expect(restoreResponse.body.data.item.isActive).toBe(true);

    // Step 8: Verify the label is restored
    const afterRestoreResponse = await request(app)
      .get(`/api/label/${testLabelId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(afterRestoreResponse.body.success).toBe(true);
    expect(afterRestoreResponse.body.data._id).toBe(testLabelId);
    expect(afterRestoreResponse.body.data.isActive).toBe(true);
  });
});