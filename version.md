# 版本更新日志

## v8.0.0
- 全体代码整理了一遍

## v7.5.0
- 一个账户切换身份

## v7.4.6
- 优化 course 模块

## v7.4.5
- Student api文档

## v7.4.4
- res.status(500) 优化

## v7.4.3
- Student 模块优化

## v7.4.2
- User 用户模块优化

## v7.4.1
- Org模块优化

## v7.4.0
- 统一payloadChecker

## v7.3.1
- 检查了 Account 和 Subject 的bug 做了优化

## v7.3.0
- 优化了 登陆/refreshToken 的payload
- 新增 pack 课包模块
- 更新了文档

## v7.2.2
- course 的 validator edit 有问题 已经解决

## v7.2.1
- 删除了 course 状态锁死字段， 暂时管理员修改
- 加入了大量的 immutable 大部分不让修改

## v7.2.0
- 新增了 course 课程模块
- 其他信息调整

## v7.1.1
- 更新 _Subject.dao.js 到 Subject.dao.js

## v7.1.0
- 新增了 Subject 科目模块
- 其他信息调整

## v7.0.2
- 更新 _Room.dao.js 到 Room.dao.js

## v7.0.1
- 更新 教室模块的 api文档

## v7.0.0
- 增加了 教室模块

## v6.0.2
- [bugger]修改 UserCT selfEdit 

## v6.0.1
- 增加了 DOCS: API 文档

## v6.0.0
- 与前端无关
- 去掉了 controller 文件中的 错误处理 文件 自己写 try catch
- 增加了 Room 管理模块
# Room 管理模块 测试错误

## v5.1.0
- 给模型加入了 DAO 文件

## v5.0.3
- 给seed增加了一些数据

## v5.0.2
- 给模型加入了 文件注释

## v5.0.1
- 不需要前端修改代码
- 增加了业务模型

## v5.0.0
- 修改了 最后的 bug
- 前端同步 git

## v4.0.0
- 验证了前端的所有接口，修改了 后端bug

## v3.8.0
- modelDAO层 处理一些数据问题,确保User对应的账号 只能是User类型

## v3.7.0
- 修改了一些字段和验证

## v3.6.0
- 优化了一些权限

## v3.5.0
- 做事务的时候 edit 出现了bug 修复了

## v3.3.1
- student DAO 权限修复

## v3.3.0
- 环境变量控制 是否开启事务

## v3.2.0
- edit 功能也改成了 支持事务

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