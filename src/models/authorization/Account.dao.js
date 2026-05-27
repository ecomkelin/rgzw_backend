const { AccountModel, AccountEnums, AccountDOC } = require('./Account.model');
const DAO = require('@models/DAO');

const list = async (payload = {}, filter, options) => {
    try {
        // 验证权限
        if (payload.accountType !== 'User') {
            throw ({ code: 403, message: "您无权查看账户列表" });
        }
        if (!payload.isAdmin) {
            throw ({ code: 403, message: "只有管理员才能查看账户列表" });
        }

        // 根据权限 剩下的 filter 只查询活跃账户
        const permFilter = { ...filter };

        const { items, total } = await DAO.list(AccountModel, permFilter, options);
        return { items, total, permFilter };
    } catch (e) {
        console.error('AccountDao list error:', e);
        throw e;
    }
};

const detail = async (payload = {}, _id, options) => {
    try {
        const { item } = await DAO.detail(AccountModel, _id, options);

        if (!item) {
            throw ({ code: 404, message: "此 账户 数据已不存在" });
        }

        // 验证权限 - 管理员可以查看任何账户，普通用户只能查看自己的账户
        if (!payload.isAdmin && item._id.toString() !== payload._id.toString()) {
            throw ({ code: 403, message: "没有权限访问此账户" });
        }

        return { item };
    } catch (e) {
        console.error('AccountDao detail error:', e);
        throw e;
    }
};

/**
 * 
 * @param {*} payload 
 * @param {*} doc { code, password, ...} 其中 password 是明文密码，DAO层会处理成 passwordHash 存储
 * @param {*} options: {session} 事务 
 * @returns 
 */
const add = async (payload, doc, options) => {
    try {
        // 只有管理员可以创建账户
        if (payload.accountType !== 'User') {
            throw ({ code: 403, message: "您无权添加账户 1111111" });
        }
        if (!payload.isAdmin) {
            doc.isAdmin = false
            if (payload.currentUser?.roleTemp !== 'manager') {
                throw ({ code: 403, message: "只有管理员才能创建账户" });
            }
        }


        // 处理密码
        if (doc.password) {
            doc.passwordHash = doc.password;
            delete doc.password;
        }

        doc.createdBy = payload.currentUser?._id;

        const existing = await AccountModel.findOne({ $or: [{ code: doc.code }, { phone: doc.phone }] });
        if (existing) {
            throw ({ code: 400, message: '手机号或账号已被占用' });
        }

        const { item } = await DAO.add(AccountModel, doc, options);
        delete item.passwordHash;
        delete item.currentSessionId

        return { item };
    } catch (e) {
        console.error('AccountDao create error:', e);
        throw e;
    }
};

/**
 * 
 * @param {*} payload 
 * @param {*} _id 
 * @param {*} doc 
 * @param {*} options: {session} 事务 
 * @returns 
 */
const edit = async (payload = {}, _id, doc, options) => {
    try {
        // 验证目标账户是否存在
        const targetAccount = await AccountModel.findById(_id);
        if (!targetAccount) {
            throw ({ code: 11000, message: '账户不存在' });
        }

        // 只有管理员可以修改任何账户，普通用户只能修改自己的账户
        if (!payload.isAdmin && targetAccount._id.toString() !== payload._id.toString()) {
            throw ({ code: 403, message: "没有权限修改此账户" });
        }

        // 处理密码
        if (doc.password) {
            doc.passwordHash = doc.password;
            delete doc.password;
        }

        const existing = await AccountModel.findOne({ $or: [{ phone: doc.phone }, { code: doc.code }], _id: { $ne: _id } });
        if (existing) {
            throw ({ message: 11000, code: '手机号或账号已被占用' });
        }

        const { item } = await DAO.edit(targetAccount, options);
        delete item.passwordHash; // 确保返回时不包含密码哈希字段

        return { item };

    } catch (e) {
        console.error('AccountSV edit error:', e);
        throw e;
    }
};

// account 不能被删除 remove 只需要在 把 isActive 修改为 false


module.exports = {
    AccountDAO: {
        list,
        detail,
        add,
        edit,
    },
    AccountModel, AccountDOC, AccountEnums,
}