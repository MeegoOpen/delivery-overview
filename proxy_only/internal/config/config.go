package config

import (
	"fmt"
	"log"
	"os"

	"github.com/goccy/go-yaml"
)

// Config 应用配置结构体
type Config struct {
	Port           string `yaml:"port"`
	ProxyTarget    string `yaml:"proxy_target"`
	FeishuAPIHost  string `yaml:"feishu_api_host"`
	FeishuPluginID string `yaml:"feishu_plugin_id"`
	FeishuPluginSecret string `yaml:"feishu_plugin_secret"`
}

// LoadConfig 从配置文件加载配置
func LoadConfig(configPath string) (*Config, error) {
	// 如果未指定配置文件路径，使用默认路径
	if configPath == "" {
		configPath = "./config.yaml"
	}

	// 检查配置文件是否存在
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		log.Printf("配置文件 %s 不存在，将使用默认配置", configPath)
		return getDefaultConfig(), nil
	}

	// 读取配置文件内容
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("读取配置文件失败: %v", err)
	}

	// 解析YAML配置
	config := &Config{}
	err = yaml.Unmarshal(data, config)
	if err != nil {
		return nil, fmt.Errorf("解析配置文件失败: %v", err)
	}

	// 应用默认值
	applyDefaults(config)

	return config, nil
}

// getDefaultConfig 获取默认配置
func getDefaultConfig() *Config {
	return &Config{
		Port:           "8080",
		ProxyTarget:    "https://project.feishu.cn",
		FeishuAPIHost:  "https://project.feishu.cn",
		FeishuPluginID: "",
		FeishuPluginSecret: "",
	}
}

// applyDefaults 应用默认值
func applyDefaults(config *Config) {
	defaultConfig := getDefaultConfig()

	if config.Port == "" {
		config.Port = defaultConfig.Port
	}
	if config.ProxyTarget == "" {
		config.ProxyTarget = defaultConfig.ProxyTarget
	}
	if config.FeishuAPIHost == "" {
		config.FeishuAPIHost = defaultConfig.FeishuAPIHost
	}
}