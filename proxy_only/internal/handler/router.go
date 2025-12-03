package handler

import (
    "proxy_only/internal/auth"

    "github.com/gin-gonic/gin"
)

func NewRouter(target string, feishuAuth *auth.FeishuAuth) *gin.Engine {
    router := gin.Default()

    // 保留与原工程一致的 CORS 配置
    router.Use(func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, x-user-key,locale")
        c.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Length")
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }

        c.Next()
    })

    proxyHandler := NewProxyHandler(target, feishuAuth)

    // 仅保留 proxy 路由能力
    router.Any("/proxy/*path", proxyHandler.ProxyRequest)

    return router
}

