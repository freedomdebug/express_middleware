[TOC]
# 项目简介
- author: chips
- 一个基于Nodejs-express的有关数据库操作，kafka生产者，初始化服务，async/await中间件,日志和异常处理等的库

# 部署步骤
- git clone  https://github.com/beita1/express_middleware.git
- cd express_middleware
- npm install

# 目录结构描述
## lib
- action: 常用的业务方法
- common: 常量
- init: 服务的初始化操作
- kafka: 封装kafka相关方法的模块
- middleware: 中间件，目前包含封装了async/await的中间件
- mysql: 封装mysql相关方法的模块
- utils: 非业务型的全局方法

# 版本内容更新
## v0.1.0 (2018/12/10 21:34)
- 1.增加kafka连接和发送模块
- 2.增加MYSQL连接和异步/同步增删改查数据库模块
- 3.增加utils方法，其中包括log,异常捕获，字符串处理函数等
- 4.增加Middleware中间件，目前封装了async/await
- 5.增加action模块，封装了一些偏业务的功能，比如接收pdf图片并保存，string转md5等功能
- 6.增加init模块，用于服务启动时一些数据的预加载与预处理