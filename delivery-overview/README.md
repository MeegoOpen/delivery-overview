# Feishu Project App Delivery Detail 插件

该项目是 飞书项目 内置应用的交付详情控件插件。本文档介绍项目结构、开发与构建流程、网络层约定、接口清单，以及近期网络改造的变更说明。

## 环境与依赖
- Node.js 与 Yarn
- 主要依赖：
  - `react`, `react-dom`
  - `@douyinfe/semi-ui`, `@douyinfe/semi-icons`
  - `axios`
- TypeScript 配置：`target` 与 `lib` 为 `es2018` 以支持 `Promise.finally`。

## 目录结构
- `src/api/`
  - `request.ts`：统一的 Axios 实例与拦截器、QPS 限流与缓存（`limitPost`/`limitGet`）
  - `services.tsx`：业务接口封装
- `src/page/ControlDetailDeliverables/`
  - `services.ts`：页面局部服务（如交付列表获取）
  - 其他展示与工具代码
- `src/constants/index.ts`：常量与配置（`requestHost`、字段文案）
- `config/`：环境配置与基础清单
- `scripts.js`：驱动 `lpm` 启动/构建/发布


## 开发与运行
- 开发：
  - `yarn install`
  - `yarn dev`（或使用 `dev:ide` 指定 IDE 本地代理）
- 构建：
  - `yarn build`
- 发布：
  - `yarn deploy <token>`（需要 LPM 账号与权限）

## 网络层说明
### Axios 实例与拦截器（`src/api/request.ts`）
- BaseURL 拼接：对以 `/` 开头的 `config.url` 自动前置 `requestHost`
- Header 注入：
  - `X-USER-KEY`：来自 `sdk.Context.loginUser.id`
  - `locale`：来自 `sdk.Context.language`
- 响应：统一返回 `response.data`；`code !== 0` 时 `console.error` 记录错误（已移除 slardar 上报）
- QPS 限流与缓存：
  - `limitPost`：POST QPS 限制为 9/s，并对同 `(url, payload)` 结果 5s 缓存
  - `limitGet`：GET 同样支持上述限流与缓存策略

### 重要接口（`src/api/services.tsx` 与页面服务）
- 获取工作项字段：
  - `fetchWorkObjectFields2(projectKey, workItemKey, isFormat?)`
  - 路径：``/open_api/${projectKey}/field/all``（将 `projectKey` 带入 path）
  - 参数：`{ work_item_type_key: workItemKey }`
  - 说明：可选将返回字段进行类型规范化（`formatFields`）
- 获取用户信息：
  - `fetchUserInfo(user_keys: string[])`
  - 路径：`/open_api/user/query`
  - 入参：`{ user_keys: string[] }`
  - 返回：`{ data: IUserInfo[], err_code: number, err_msg: string }`
- 获取关联工作项：
  - `fetchRelatedWorkItems(projectKey, workObjectId, id_list, field_keys)`
  - 路径：``/open_api/${projectKey}/work_item/${workObjectId}/query``
  - 入参：`{ work_item_ids: number[], fields: string[] }`
- 页面交付列表：
  - `fetchDeliverList(payload)`（`src/page/ControlDetailDeliverables/services.ts`）
  - 方法：GET
  - 路径：``/open_api/${project_key}/work_item/${work_item_type_key}/${work_item_id}/wbs_view``
  - Query：`need_union_deliverable=true`
  - 返回：`res.data`（页面服务已展开返回）

## 常见问题
- 路径未替换：确认是否使用了反引号 `` `...${var}...` `` 而非引号 `"...${var}..."`
- `Promise.finally` 报错：确保 `tsconfig` 的 `target/lib` 为 `es2018`
- 依赖未找到：确认 `package.json` 依赖完整，并执行 `yarn install`

## License

