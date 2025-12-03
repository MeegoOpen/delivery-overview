package main

import (
	"flag"
	"fmt"
	"log"

	"proxy_only/internal/auth"
	"proxy_only/internal/config"
	"proxy_only/internal/handler"
)

func main() {
	// 解析命令行参数，获取配置文件路径
	configPath := flag.String("config", "./config.yaml", "配置文件路径")
	flag.Parse()

	// 加载配置
	cfg, err := config.LoadConfig(*configPath)
	if err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	// 打印配置信息（不打印敏感信息）
	log.Printf("使用配置: 端口=%s, 代理目标=%s, 飞书API=%s", 
		cfg.Port, cfg.ProxyTarget, cfg.FeishuAPIHost)

	// 初始化飞书认证
	feishuAuth := auth.NewFeishuAuth(cfg.FeishuAPIHost, cfg.FeishuPluginID, cfg.FeishuPluginSecret)

	// 设置路由
	router := handler.NewRouter(cfg.ProxyTarget, feishuAuth)

	// 启动服务
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("proxy-only server listening on %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("启动服务失败: %v", err)
	}
}