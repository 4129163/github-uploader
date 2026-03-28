#!/bin/bash

# =============================================================================
# 云服务器环境配置脚本
# 自动配置防火墙、安装 PM2、设置开机自启
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

# 安装 PM2
install_pm2() {
    log_info "安装 PM2 进程管理器..."
    sudo npm install -g pm2
    log_success "PM2 安装完成"
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."
    
    # 检测防火墙类型
    if command -v ufw &> /dev/null; then
        sudo ufw allow 22/tcp
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        sudo ufw allow 3000/tcp
        sudo ufw --force enable
        log_success "UFW 防火墙配置完成"
    elif command -v firewall-cmd &> /dev/null; then
        sudo firewall-cmd --permanent --add-port=22/tcp
        sudo firewall-cmd --permanent --add-port=80/tcp
        sudo firewall-cmd --permanent --add-port=443/tcp
        sudo firewall-cmd --permanent --add-port=3000/tcp
        sudo firewall-cmd --reload
        log_success "Firewalld 配置完成"
    else
        log_warning "未检测到防火墙，跳过配置"
    fi
}

# 创建 PM2 配置文件
create_pm2_config() {
    log_info "创建 PM2 配置文件..."
    
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'feishu-github-uploader',
    script: './dist/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
    
    mkdir -p logs
    log_success "PM2 配置创建完成"
}

# 设置开机自启
setup_startup() {
    log_info "设置开机自启..."
    sudo pm2 startup systemd
    sudo pm2 save
    log_success "开机自启设置完成"
}

# 主函数
main() {
    echo "========================================"
    echo "  云服务器环境配置"
    echo "========================================"
    echo ""
    
    install_pm2
    configure_firewall
    create_pm2_config
    setup_startup
    
    echo ""
    echo "========================================"
    log_success "服务器配置完成！"
    echo "========================================"
    echo ""
    echo "常用命令:"
    echo "  启动服务: pm2 start ecosystem.config.js"
    echo "  停止服务: pm2 stop feishu-github-uploader"
    echo "  查看日志: pm2 logs"
    echo "  查看状态: pm2 status"
    echo ""
}

main
