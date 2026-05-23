// tests/__mocks__/auth.js
// Mock authentication utilities for testing

const createMockPayload = (overrides = {}) => {
  const mongoose = require('mongoose');

  return {
    _id: new mongoose.Types.ObjectId(),
    Org_id: new mongoose.Types.ObjectId(),
    isAdmin: false,
    roleTemp: 'manager',
    ...overrides
  };
};

const createMockReq = (params = {}, body = {}, query = {}) => {
  return {
    params: params || {},
    body: body || {},
    query: query || {},
    validData: body || {}, // For validation middleware
    payload: createMockPayload() // For auth middleware
  };
};

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  return res;
};

module.exports = {
  createMockPayload,
  createMockReq,
  createMockRes
};