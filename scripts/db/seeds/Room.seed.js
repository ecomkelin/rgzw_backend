const { RoomModel } = require('@models/organization/physical/Room.model');

const roomSeeds = [
  {
    _id: '6940b0000000000000000201',
    name: '101 多媒体教室',
    capacity: 12,
    location: '一楼东侧',
    description: '配 65 寸电视 + 投影 + 12 台学生机',
    status: 'available',
    isActive: true,
    sort: 100,
    Org: '693e7b24b558d56179c0f7ae'
  },
  {
    _id: '6940b0000000000000000202',
    name: '102 实验室',
    capacity: 8,
    location: '一楼西侧',
    description: '机器人套件 + 焊接台',
    status: 'available',
    isActive: true,
    sort: 90,
    Org: '693e7b24b558d56179c0f7ae'
  },
  {
    _id: '6940b0000000000000000203',
    name: '103 普通教室',
    capacity: 16,
    location: '二楼',
    description: '白板 + 投影',
    status: 'available',
    isActive: true,
    sort: 80,
    Org: '693e7b24b558d56179c0f7ae'
  }
];

async function initializeRooms() {
  try {
    for (const seed of roomSeeds) {
      await RoomModel.updateOne({ _id: seed._id }, { $set: seed }, { upsert: true });
    }
    console.info(`已 upsert 教室: ${roomSeeds.length} 间`);
  } catch (e) {
    console.error('Room.seed 失败:', e);
    throw e;
  }
}

module.exports = { initializeRooms, roomSeeds };
