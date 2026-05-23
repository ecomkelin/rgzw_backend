# 版本更新日志

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