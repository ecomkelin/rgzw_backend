const express = require("express");
const router = express.Router();
const loadRoutesRecursively = require("./__utils/routeLoader");
const apiRoutes = require("./__utils/route_apis")

// 路由说明
router.get("/", (req, res) => {
    res.status(200).json({
        code: 200,
        message: "欢迎使用API服务!",
        data: {
            api_documentation: "/api/list, 查看所有接口列表"
        }
    });
});
// 获取所有接口列表
router.get("/list", apiRoutes.getApis);

// 加载当前目录下的 不包含 __ 开头的目录 路由文件
try {
    const path = require("path");
    const autoPathDir = path.join(process.cwd(), 'src/modules');
    loadRoutesRecursively(autoPathDir, router);
} catch (error) {
    console.error("❌ 加载路由失败:", error);
    process.exit(1);
}

module.exports = router;
