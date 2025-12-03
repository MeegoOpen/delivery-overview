#!/bin/bash
set -euo pipefail

# Build the application
go build -o proxy_only_server cmd/server/main.go

echo "Built proxy_only_server"
echo "Run with: ./proxy_only_server"

