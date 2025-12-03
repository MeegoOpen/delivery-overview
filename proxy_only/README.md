# Proxy Only Gin Project

一个基于 Gin 的精简服务，仅保留 `proxy` 路由能力，并保留原工程的 CORS 配置。

## 配置文件

创建 `config.yaml` 文件（可参考 `config.yaml.example`）：

```yaml
port: "8080"                    # 服务端口
proxy_target: "https://project.feishu.cn"  # 反向代理目标
feishu_api_host: "https://project.feishu.cn"  # 飞书 API 域名
feishu_plugin_id: ""            # 插件 ID，用于获取 Token
feishu_plugin_secret: ""        # 插件 Secret，用于获取 Token
```

若 `feishu_plugin_id/feishu_plugin_secret` 未配置，服务仍会转发请求，但不会设置 `X-Plugin-Token` 请求头。

## 构建与运行

```bash
cd proxy_only
go mod tidy
go build -o proxy_only_server cmd/server/main.go

# 使用默认配置文件路径 ./config.yaml
./proxy_only_server

# 或指定配置文件路径
./proxy_only_server --config=path/to/your/config.yaml
```

或使用脚本：

```bash
cd proxy_only
./scripts/run.sh