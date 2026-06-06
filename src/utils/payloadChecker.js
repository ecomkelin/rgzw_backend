exports.payloadChecker = (payload = {}) => {
    if (payload.accountType === 'User') {
        if (!payload.currentUser) {
            throw ({ code: 403, message: "您的账户信息有误: 您是用户 需要有用户信息" });
        }
        if (!payload.currentUser._id) {
            throw ({ code: 403, message: "您的账户信息有误: 您是用户 需要有_id信息" });
        }
        if (!payload.currentUser.Org) {
            throw ({ code: 403, message: "您的账户信息有误: 您是用户 需要有机构信息" });
        }
        if (!payload.currentUser.nickname) {
            throw ({ code: 403, message: "您的账户信息有误: 您是用户 需要有用户昵称" });
        }
        if (!payload.currentUser.roleTemp) {
            throw ({ code: 403, message: "您的账户信息有误: 您是用户 需要有角色信息" });
        }
    } else if (payload.accountType === 'Student') {
        if (payload.isAdmin) {
            throw ({ code: 403, message: "您的账户信息有误: 学生账户不应该有管理员权限" });
        }
        if (!payload.currentStudent) {
            throw ({ code: 403, message: "您的账户信息有误: 您是学生 需要有学生信息" });
        }
        if (!payload.currentStudent._id) {
            throw ({ code: 403, message: "您的账户信息有误: 您是学生 需要有_id信息" });
        }
        if (!payload.currentStudent.Org) {
            throw ({ code: 403, message: "您的账户信息有误: 您是学生 需要有机构信息" });
        }
        if (!payload.currentStudent.name) {
            throw ({ code: 403, message: "您的账户信息有误: 您是学生 需要有学生姓名" });
        }
    } else {
        throw ({ code: 403, message: "您的身份有误" });
    }
}

exports.userPayloadChecker = (payload = {}) => {
    if (payload.accountType !== 'User') {
        throw ({ code: 403, message: "您不是用户账户" });
    }
    if (!payload.currentUser || !payload.currentUser._id) {
        throw ({ code: 403, message: "用户信息缺失" });
    }
    if (!payload.currentUser.Org) {
        throw ({ code: 403, message: "用户机构信息缺失" });
    }
    if (!payload.currentUser.nickname) {
        throw ({ code: 403, message: "用户昵称缺失" });
    }
    if (!payload.currentUser.roleTemp) {
        throw ({ code: 403, message: "用户角色信息缺失" });
    }
}

exports.studentPayloadChecker = (payload = {}) => {
    if (payload.accountType !== 'Student') {
        throw ({ code: 403, message: "您不是学生账户" });
    }
    if (payload.isAdmin) {
        throw ({ code: 403, message: "学生账户不应有管理员权限" });
    }
    if (!payload.currentStudent || !payload.currentStudent._id) {
        throw ({ code: 403, message: "学生信息缺失" });
    }
    if (!payload.currentStudent.Org) {
        throw ({ code: 403, message: "学生机构信息缺失" });
    }
    if (!payload.currentStudent.name) {
        throw ({ code: 403, message: "学生姓名缺失" });
    }
}



exports.isStudent = (payload) => payload?.accountType === 'Student';

exports.isUser = (payload) => payload?.accountType === 'User';

exports.isManager = (payload) =>
    payload?.accountType === 'User' && payload.currentUser?.roleTemp === 'manager';

exports.isAdmin = (payload) =>
    payload?.accountType === 'User' && payload.isAdmin === true;

