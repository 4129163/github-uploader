#!/bin/bash

# =============================================================================
# CLI 工具一键部署脚本
# 小白专用 - 只需要复制粘贴即可运行
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }
log_step() { echo -e "${CYAN}[$1/$2]${NC} $3"; }

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未安装"
        echo ""
        echo "请先运行环境安装脚本:"
        echo "  bash <(curl -fsSL https://raw.githubusercontent.com/4129163/github-uploader/main/deploy-scripts/install-node.sh)"
        exit 1
    fi
}

# 主函数
main() {
    clear
    echo "========================================"
    echo "  GitHub Uploader CLI 一键部署"
    echo "========================================"
    echo ""
    
    # 步骤1: 检查环境
    log_step "1" "4" "检查环境..."
    check_command node
    check_command npm
    check_command git
    log_success "环境检查通过"
    echo ""
    
    # 步骤2: 下载项目
    log_step "2" "4" "下载项目..."
    if [ -d "github-uploader" ]; then
        log_warning "目录已存在，正在更新..."
        cd github-uploader
        git pull origin main
    else
        git clone https://github.com/4129163/github-uploader.git
        cd github-uploader
    fi
    log_success "项目下载完成"
    echo ""
    
    # 步骤3: 安装依赖
    log_step "3" "4" "安装 CLI 工具依赖..."
    cd cli-tool
    npm install
    log_success "依赖安装完成"
    echo ""
    
    # 步骤4: 运行
    log_step "4" "4" "启动应用"
    echo ""
    log_success "部署完成！"
    echo ""
    echo "========================================"
    echo "  使用指南"
    echo "========================================"
    echo ""
    echo "1. 获取 GitHub Token:"
    echo "   访问: https://github.com/settings/tokens"
    echo "   点击 'Generate new token (classic)'"
    echo "   勾选 'repo' 权限"
    echo ""
    echo "2. 运行上传工具:"
    echo "   cd cli-tool"
    echo "   npm start"
    echo ""
    echo "3. 按提示输入 Token 和仓库名称"
    echo ""
    echo "========================================"
    echo ""
    
    # 询问是否立即运行
    read -p "是否立即运行? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm start
    fi
}

# 运行
main
