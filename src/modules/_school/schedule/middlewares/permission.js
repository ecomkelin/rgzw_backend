const ApiResponse = require('@utils/response');
const { isManager } = require('@utils/payloadChecker');

const checkPermission = (permissionType) => {
    return (req, res, next) => {
        try {
            const payload = req.payload;
            let hasPermission = false;
            switch (permissionType) {
                case 'manager':
                    hasPermission = isManager(payload);
                    break;
                default:
                    hasPermission = false;
            }
            if (!hasPermission) {
                return res.status(403).json(
                    ApiResponse.error({ code: 403, message: "需要经理及以上权限" })
                );
            }
            next();
        } catch (e) {
            const statusCode = e.code || 500;
            return res.status(statusCode).json(ApiResponse.error(e));
        }
    };
};

exports.manager = checkPermission('manager');
