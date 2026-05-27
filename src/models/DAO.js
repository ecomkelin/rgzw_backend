/**
 * 注意 populate 的使用，若涉及到权限控制，建议在 service 层进行 populate 后再进行权限过滤，而不是直接在 DAO 层进行 populate 和权限过滤
 * 因为 DAO 层应该尽量保持通用和无状态，不应该直接涉及权限逻辑
 * 如果在 DAO 层进行 populate 和权限过滤，可能会导致权限逻辑分散在多个地方，难以维护和测试
 * 推荐的做法是在 service 层调用 DAO 获取原始数据后，再进行 populate 和权限过滤，这样可以更清晰地分离数据访问和业务逻辑
 *
[{
    path: '字段名',       // 要填充的字段
    select: '字段1 字段2',// 要返回的字段
    match: { 条件 },      // 过滤条件
    options: {           // 排序/分页
        sort: {},
        limit: 10,
        skip: 0
    },
    populate: [{}]         // 嵌套更深层级
}]
 */


/**
 * 
 * @param {*} Model 
 * @param {*} filter 
 * @param {*} options 
 * @returns 
 */
const list = async (Model, filter = {}, options = {}) => {
    try {
        const { limit = 12, skip = 0, sort = {}, populate = [], regExp } = options;

        const total = await Model.countDocuments(filter);
        const items = await Model.find(filter)
            .populate(populate)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        return { items, total };
    } catch (e) {
        console.error('DAO list error:', e);
        throw e;
    }
};

const detail = async (Model, _id, options = {}) => {
    try {
        const { populate = [] } = options;

        const item = await Model.findById(_id)
            .populate(populate);

        return { item };
    } catch (e) {
        console.error('DAO detail error:', e);
        throw e;
    }
};

/**
 * 
 * @param {*} Model 
 * @param {*} doc 
 * @param {*} options: {session} 事务 
 * @returns 
 */
const add = async (Model, doc, { session }) => {
    try {
        const options = session ? { session } : undefined;

        const item = new Model(doc);
        await item.save(options);
        return { item };
    } catch (e) {
        console.error('DAO add error:', e);
        throw e;
    }
};

const edit = async (Model, _id, doc) => {
    try {
        const item = await Model.findByIdAndUpdate(_id, doc, { new: true });

        if (!item) {
            throw ({ code: 404, message: "此数据已不存在" });
        }

        return { item };
    } catch (e) {
        console.error('DAO edit error:', e);
        throw e;
    }
};

const remove = async (Model, _id) => {
    try {
        const item = await Model.findByIdAndDelete(_id);

        if (!item) {
            throw ({ code: 404, message: "此数据已不存在" });
        }

        return { item };
    } catch (e) {
        console.error('DAO remove error:', e);
        throw e;
    }
};


const addMany = async (Model, docs) => {
    try {
        const items = await Model.insertMany(docs);
        return { items };
    } catch (e) {
        console.error('DAO addMany error:', e);
        throw e;
    }
};

const editMany = async (Model, filter, data) => {
    try {
        const result = await Model.updateMany(filter, data);
        return { result };
    } catch (e) {
        console.error('DAO editMany error:', e);
        throw e;
    }
};

const removeMany = async (Model, filter) => {
    try {
        const result = await Model.deleteMany(filter);
        return { result };
    } catch (e) {
        console.error('DAO removeMany error:', e);
        throw e;
    }
};

module.exports = {
    list,
    detail,
    add,
    edit,
    remove,
    addMany,
    editMany,
    removeMany,
};