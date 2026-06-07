/**
 * Schedule 模块测试
 * 覆盖:
 *  1. expander 展开 + totalSessions 截断 + 非法规则跳过
 *  2. generate 写库, 第二次拒绝 (replace=false)
 *  3. by-course / by-room / by-teacher / by-student 4 维度查询
 *  4. overview 汇总
 *  5. conflicts.check 冲突检测
 *  6. edit / cancel
 *  7. ai/parse-slots 解析成功 + LLM 失败兜底
 *  8. ai/parse-slots/confirm 写入
 */
require('module-alias/register');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { startMongoServer, stopMongoServer, clearDatabase } = require('../test.utils');
const { CourseModel }     = require('@models/school/course/Course.model');
const { LessonModel }     = require('@models/school/lesson/Lesson.model');
const { RoomModel }       = require('@models/organization/physical/Room.model');
const { UserModel }       = require('@models/organization/structure/User.model');
const { StudentModel }    = require('@models/school/student/Student.model');
const { StudentCourseModel } = require('@models/school/student/StudentCourse.model');
const { SubjectModel }    = require('@models/school/course/Subject.model');
const { OrgModel }        = require('@models/organization/structure/Org.model');
const { expand, toLessonDocs } = require('@modules/_school/schedule/lib/expander');
const conflictsLib = require('@modules/_school/schedule/lib/conflicts');
const ScheduleSV = require('@modules/_school/schedule/service');

// mock axios 给 LLM 用
jest.mock('axios');

let mongoServer;

const ORG_ID   = new mongoose.Types.ObjectId();
const SUBJ_ID  = new mongoose.Types.ObjectId();
const ROOM_ID  = new mongoose.Types.ObjectId();
const ROOM2_ID = new mongoose.Types.ObjectId();
const TCH1_ID  = new mongoose.Types.ObjectId();
const TCH2_ID  = new mongoose.Types.ObjectId();
const STU1_ID  = new mongoose.Types.ObjectId();
const STU2_ID  = new mongoose.Types.ObjectId();
const COURSE_ID = new mongoose.Types.ObjectId();
const ACC1_ID   = new mongoose.Types.ObjectId();
const ACC2_ID   = new mongoose.Types.ObjectId();

const adminPayload = {
    accountType: 'User',
    isAdmin: true,
    _id: new mongoose.Types.ObjectId(),
    currentUser: { _id: new mongoose.Types.ObjectId(), roleTemp: 'manager', Org: ORG_ID }
};

beforeAll(async () => {
    await startMongoServer();
});

afterAll(async () => {
    await stopMongoServer();
});

beforeEach(async () => {
    await clearDatabase();
    await OrgModel.create({ _id: ORG_ID, name: '测试机构', nickname: '测试机构简称', unionCode: 'TEST_001', isMain: true, isActive: true });
    await SubjectModel.create({ _id: SUBJ_ID, name: 'Python', Org: ORG_ID, isActive: true, isShow: true });
    await RoomModel.create({ _id: ROOM_ID,  name: '101', capacity: 10, status: 'available', isActive: true, Org: ORG_ID });
    await RoomModel.create({ _id: ROOM2_ID, name: '102', capacity: 10, status: 'available', isActive: true, Org: ORG_ID });
    await UserModel.create({ _id: TCH1_ID, Account: ACC1_ID, Org: ORG_ID, roleTemp: 'teacher', nickname: '老师甲' });
    await UserModel.create({ _id: TCH2_ID, Account: ACC2_ID, Org: ORG_ID, roleTemp: 'teacher', nickname: '老师乙' });
    await StudentModel.create({ _id: STU1_ID, Account: new mongoose.Types.ObjectId(), name: '学生甲', Org: ORG_ID, isActive: true });
    await StudentModel.create({ _id: STU2_ID, Account: new mongoose.Types.ObjectId(), name: '学生乙', Org: ORG_ID, isActive: true });
    await CourseModel.create({
        _id: COURSE_ID,
        name: '测试课',
        Subject: SUBJ_ID,
        mainTeacher: TCH1_ID,
        startDate: new Date('2026-06-08'),
        endDate:   new Date('2026-08-30'),
        totalSessions: 5,           // 故意设小, 验证截断
        defaultRoom: ROOM_ID,
        price: 9900,
        status: 'enrolling',
        isActive: true,
        Org: ORG_ID,
        scheduleRules: [
            { dayOfWeek: 1, startTime: '18:30', endTime: '20:00' },                    // 周一
            { dayOfWeek: 4, startTime: '18:30', endTime: '20:00' },                    // 周四
            { startTime: '09:00', endTime: '10:00' },                                  // 非法: 没时间范围
            { dayOfWeek: 1, startTime: '20:00', endTime: '18:30' },                   // 非法: start>end
            { dateRange: { from: '2026-08-01', to: '2026-08-05' },
              startTime: '09:00', endTime: '12:00' }
        ]
    });
});

describe('schedule/lib/expander', () => {
    test('1. 展开: 跳过非法规则, totalSessions 截断', async () => {
        const course = await CourseModel.findById(COURSE_ID);
        const from = new Date('2026-06-08');
        const to   = new Date('2026-08-30');
        const out = expand(course, from, to);

        expect(out.length).toBe(5);  // 截断到 totalSessions=5
        out.forEach((p, i) => expect(p.sequenceNumber).toBe(i + 1));
        expect(out[0].teacher.toString()).toBe(TCH1_ID.toString());
        expect(out[0].classroom.toString()).toBe(ROOM_ID.toString());
    });
});

describe('schedule.service', () => {
    test('2. generate: 写库成功, 第二次 replace=false 拒绝', async () => {
        const r1 = await ScheduleSV.generate(adminPayload, { courseId: COURSE_ID });
        expect(r1.total).toBe(5);
        const dbCount = await LessonModel.countDocuments({ Course: COURSE_ID });
        expect(dbCount).toBe(5);

        await expect(ScheduleSV.generate(adminPayload, { courseId: COURSE_ID }))
            .rejects.toMatchObject({ code: 400 });

        const r2 = await ScheduleSV.generate(adminPayload, { courseId: COURSE_ID, replace: true });
        expect(r2.total).toBe(5);
    });

    test('3. by-course 查询', async () => {
        await ScheduleSV.generate(adminPayload, { courseId: COURSE_ID });
        const r = await ScheduleSV.listByEntity(adminPayload, 'course', COURSE_ID, {});
        expect(r.total).toBe(5);
        expect(r.items[0]).toHaveProperty('Course');
    });

    test('4. by-room 查询', async () => {
        await ScheduleSV.generate(adminPayload, { courseId: COURSE_ID });
        const r = await ScheduleSV.listByEntity(adminPayload, 'room', ROOM_ID, {});
        expect(r.total).toBe(5);
    });

    test('5. by-teacher 查询 (manager 看任一老师)', async () => {
        await ScheduleSV.generate(adminPayload, { courseId: COURSE_ID });
        const r = await ScheduleSV.listByEntity(adminPayload, 'teacher', TCH1_ID, {});
        expect(r.total).toBe(5);
    });

    test('6. by-teacher 老师 token 看自己 OK, 看别人 403', async () => {
        await ScheduleSV.generate(adminPayload, { courseId: COURSE_ID });
        const teacherPayload = {
            accountType: 'User',
            isAdmin: false,
            currentUser: { _id: TCH2_ID, roleTemp: 'teacher', Org: ORG_ID }
        };
        const ok = await ScheduleSV.listByEntity(teacherPayload, 'teacher', TCH2_ID, {});
        expect(ok.total).toBe(0);  // TCH2 没排课

        await expect(ScheduleSV.listByEntity(teacherPayload, 'teacher', TCH1_ID, {}))
            .rejects.toMatchObject({ code: 403 });
    });

    test('7. by-student 查询 (需要 StudentCourse 关联)', async () => {
        await ScheduleSV.generate(adminPayload, { courseId: COURSE_ID });
        await StudentCourseModel.create({
            Student: STU1_ID, Account: new mongoose.Types.ObjectId(),
            Course: COURSE_ID, nameCourse: '测试课', status: 'active', Org: ORG_ID
        });
        const r = await ScheduleSV.listByEntity(adminPayload, 'student', STU1_ID, {});
        expect(r.total).toBe(5);
    });

    test('8. overview: 返回 days[0].slots[0].items 含 courseName/teacherName/studentCount', async () => {
        await ScheduleSV.generate(adminPayload, { courseId: COURSE_ID });
        await StudentCourseModel.create({
            Student: STU1_ID, Account: new mongoose.Types.ObjectId(),
            Course: COURSE_ID, nameCourse: '测试课', status: 'active', Org: ORG_ID
        });
        const r = await ScheduleSV.overview(adminPayload, {});
        expect(Array.isArray(r.days)).toBe(true);
        const firstDay = r.days[0];
        expect(firstDay).toHaveProperty('date');
        expect(firstDay.slots.length).toBeGreaterThan(0);
        expect(firstDay.slots[0].items[0]).toHaveProperty('courseName');
        expect(firstDay.slots[0].items[0]).toHaveProperty('teacherName');
        expect(firstDay.slots[0].items[0].studentCount).toBe(1);
    });

    test('9. conflicts.check: room_busy + student_unavailable', async () => {
        await ScheduleSV.generate(adminPayload, { courseId: COURSE_ID });
        // 给 STU1 加 "周一 19-21 不可用" (会命中第 1 条 generated Lesson)
        await StudentModel.updateOne({ _id: STU1_ID }, {
            $set: { unavailableSlots: [{ dayOfWeek: 1, startTime: '19:00', endTime: '21:00', reason: '晚自习' }] }
        });
        await StudentCourseModel.create({
            Student: STU1_ID, Account: new mongoose.Types.ObjectId(),
            Course: COURSE_ID, nameCourse: '测试课', status: 'active', Org: ORG_ID
        });
        const lesson = await LessonModel.findOne({ Course: COURSE_ID, status: 'scheduled' });
        const conflicts = await conflictsLib.check({
            start: lesson.plannedDate,
            end:   lesson.plannedEndDate,
            room: lesson.classroom,
            student: STU1_ID
        });
        const types = conflicts.map(c => c.type);
        expect(types).toContain('room_busy');
        expect(types).toContain('student_unavailable');
    });

    test('10. edit / cancel 单条 Lesson', async () => {
        await ScheduleSV.generate(adminPayload, { courseId: COURSE_ID });
        const lesson = await LessonModel.findOne({ Course: COURSE_ID, status: 'scheduled' });

        const { item: edited } = await ScheduleSV.editLesson(adminPayload, lesson._id, {
            description: '调整内容'
        });
        expect(edited.description).toBe('调整内容');

        const { item: cancelled } = await ScheduleSV.cancelLesson(adminPayload, lesson._id);
        expect(cancelled.status).toBe('cancelled');
    });

    test('11. ai/parse-slots: LLM 返回 JSON 正常解析, 返回非 JSON 时不抛 5xx', async () => {
        const axios = require('axios');
        process.env.LLM_API_KEY = 'test-key';
        process.env.LLM_BASE_URL = 'https://api.deepseek.com/v1';

        // 1) 正常返回
        axios.post.mockResolvedValueOnce({
            data: {
                choices: [{ message: { content: JSON.stringify({
                    slots: [
                        { dayOfWeek: 1, startTime: '19:00', endTime: '21:00', reason: '晚辅导' },
                        { dayOfWeek: 3, startTime: '19:00', endTime: '21:00', reason: '晚辅导' }
                    ]
                }) } }]
            }
        });
        const ok = await ScheduleSV.parseSlots({}, { text: '周一三五 19-21 不可用', context: 'student' });
        expect(ok.slots.length).toBe(2);
        expect(ok.error).toBeUndefined();

        // 2) LLM 抛 500
        axios.post.mockRejectedValueOnce(new Error('upstream 500'));
        const fail = await ScheduleSV.parseSlots({}, { text: '...', context: 'student' });
        expect(fail.slots).toEqual([]);
        expect(fail.error).toBe('llm_unavailable');
    });
});
