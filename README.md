## 飞书项目 交付物汇总插件 开源版本

原插件链接：https://project.feishu.cn/openapp/plugin_share?appKey=MII_67690EC8C3A6C001

本开源版本基于官方版本进行开发，插件核心功能一致，部分UI组件使用有差异，同时去除了前后端登录鉴权机制，仅用于企业内部插件学习及功能二次开发。

目录说明：

proxy_only 是使用golang gin框架实现的后端代理服务，用于为前端提供openapi的调用代理

delivery-overview 是插件前端源码，插件开发入门参考：https://project.feishu.cn/b/helpcenter/1p8d7djs/49k1ojm9
