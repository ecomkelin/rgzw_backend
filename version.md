# 版本更新日志

## v3.1.0
- 在add功能上 加了 事务
# 问题
- edit 还没有添加 需要调整

## v3.0.0
- 修改了 bug

## v2.6.0
- 添加了 Account 的 增加接口, 并且修改了 identityID 为非必需和非空唯一

## v2.5.0
- 编辑了 aipDesc.md 接口文档
- 优化了 account.seed.js 文件

## v2.4.0
- 修改优化了 dao 文件的权限

## v2.3.1
- 整理了文档结构

## v2.3.0
- 测试成功

## v2.2.0
- 用claude 生成了测试文件
# 问题： 没有测试成功

## v2.1.0
- 删除了 测试文件
- 删除了 claude 文档

## v2.0.2
- 整体修改完成
- 还没有测试完成

## v2.0.1
- 修改 Org到四层架构

## v2.0.0
- 四层架构：路由层 Route
   ↓
控制器层 Controller（传参、调用、返回）
   ↓
服务层 Service（业务逻辑、流程、组装）
   ↓
数据层 Model/Dao（SQL、数据权限、权限校验）

- 校验了 Account 模块 简单测试没有问题了

## v1.4.0
- 修正了一些bug
- student 测试好了

## v1.3.0
- 测试了之前的修改
- 完成了 student 模块
- roleSimp 变成了 roleTemp: 因为这只是临时用的
# student 每测试

## v1.2.0
- 完成了 user 模块
- v1.1.0 按照方法2 优化了， 但是发现不需要 decoded 只是在payload上添加上信息就好
# 还没有测试
- 先提交了

## v1.1.0
- 完成了 account 模块
# 发现了一个问题
- createBy 这个 需要时 User 而不是 Account
- 所以我需要把 currentUser 放到 payload 中
- 方法1 直接在payload 中添加 缺点每次切换账户 要重新发放token
- 方法2 token转化的叫 decoded， payload 是在decoded基础上增加的信息（推荐）

## v1.0.0
- 完成了 Org 模块

## v0.2.0
- 把之前开发项目时写的文档 归纳到 claude中 并删除了原来的文档

## v0.1.0
- 完成claude 开发文档

## v0.0.0 
- 项目初始化: 科技培训学校管理系统