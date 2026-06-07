/**
 * 教室 (Room) 种子
 * 梓潼校区目前 2 间: room1 (主教室, 12 人) / room2 (小教室, 8 人)
 */
const { RoomModel } = require('@models/organization/physical/Room.model');
const { ORG_ZITONG } = require('./Account.seed');

const ROOM_1 = '693e7c42963e26d1f8450001'; // 101 主教室
const ROOM_2 = '693e7c42963e26d1f8450002'; // 102 小教室

const roomSeeds = [
  {
    _id: ROOM_1,
    name: 'room1 主教室',
    capacity: 12,
    location: '梓潼校区 一楼',
    description: '65寸电视 + 投影 + 学生机 (12台)',
    status: 'available',
    isActive: true,
    sort: 100,
    Org: ORG_ZITONG
  },
  {
    _id: ROOM_2,
    name: 'room2 小教室',
    capacity: 8,
    location: '梓潼校区 一楼东',
    description: '白板 + 投影 + 学生机 (8台)',
    status: 'available',
    isActive: true,
    sort: 90,
    Org: ORG_ZITONG
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

module.exports = { initializeRooms, roomSeeds, ROOM_1, ROOM_2 };
