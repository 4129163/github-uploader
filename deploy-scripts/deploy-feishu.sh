#!/bin/bash

# =============================================================================
# 飞书应用一键部署脚本
# =============================================================================

set -e

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

# 检查命令
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未安装"
        exit 1
    fi
}

# 配置飞书凭证
configure_feishu() {
    echo ""
    log_info "配置飞书应用凭证"
    echo ""
    echo "请访问 https://open.feishu.cn/app 创建应用并获取以下信息:"
    echo ""
    
    read -p "请输入 App ID (cli_xxxxxxxx): " APP_ID
    read -p "请输入 App Secret: " APP_SECRET
    
    # 更新配置文件
    sed -i "s/private readonly APP_ID = '.*'/private readonly APP_ID = '$APP_ID'/" src/feishu.service.ts
    sed -i "s/private readonly APP_SECRET = '.*'/private readonly APP_SECRET = '$APP_SECRET'/" src/feishu.service.ts
    
    log_success "凭证配置完成"
}

# 主函数
main() {
    clear
    echo "========================================"
    echo "  飞书应用一键部署"
    echo "========================================"
    echo ""
    
    # 检查环境
    log_step "1" "5" "检查环境..."
    check_command node
    check_command npm
    check_command git
    log_success "环境检查通过"
    echo ""
    
    # 下载项目
    log_step "2" "5" "下载项目..."
    if [ -d "github-uploader" ]; then
        log_warning "目录已存在"
        cd github-uploader
    else
        git clone https://github.com/4129163/github-uploader.git
        cd github-uploader
    fi
    log_success "项目就绪"
    echo ""
    
    # 进入飞书应用目录
    cd feishu-app
    
    # 安装依赖
    log_step "3" "5" "安装依赖..."
    npm install
    log_success "依赖安装完成"
    echo ""
    
    # 配置凭证
    log_step "4" "5" "配置飞书凭证"
    configure_feishu
    echo ""
    
    # 编译
    log_step "5" "5" "编译项目..."
    npm run build
    log_success "编译完成"
    echo ""
    
    # 完成
    echo "========================================"
    log_success "部署完成！"
    echo "========================================"
    echo ""
    echo "启动命令:"
    echo "  开发模式: npm run dev"
    echo "  生产模式: npm start"
    echo ""
    echo "服务将运行在: http://localhost:3000"
    echo ""
    echo "飞书配置步骤:"
    echo "1. 访问 https://open.feishu.cn/app"
    echo "2. 创建企业自建应用"
    echo "3. 开启机器人能力"
    echo "4. 配置事件订阅地址: http://你的IP:3000/api/webhook/feishu"
    echo "5. 申请权限: im:message:send_as_bot"
    echo "6. 发布应用并添加到群聊"
    echo ""
    
    read -p "是否立即启动? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run dev
    fi
}

main
