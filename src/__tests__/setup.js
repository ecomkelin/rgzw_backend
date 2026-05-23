require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { initializeUsers } = require('./seeds/auth.seed');

let mongod;


jest.setTimeout(60000);

beforeAll(async () => {
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    await initializeUsers();
  } catch (error) {
    console.error('Test setup failed:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
  } catch (error) {
    console.error('Test cleanup failed:', error);
  }
});

beforeEach(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const collections = await mongoose.connection.db.collections();
      for (const collection of collections) {
        await collection.deleteMany({});
      }
      await new Promise(resolve => setTimeout(resolve, 100));
      await initializeUsers();
    }
  } catch (error) {
    console.error('Test cleanup failed:', error);
  }
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
}); 