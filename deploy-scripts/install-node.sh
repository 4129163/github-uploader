#!/bin/bash

# =============================================================================
# Node.js 自动安装脚本
# 支持: Ubuntu/Debian/CentOS/macOS
# 作者: GitHub Uploader
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检测操作系统
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            OS=$ID
            VERSION_ID=$VERSION_ID
        else
            log_error "无法检测操作系统版本"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    else
        log_error "不支持的操作系统: $OSTYPE"
        exit 1
    fi
}

# 安装 Node.js (Ubuntu/Debian)
install_node_ubuntu() {
    log_info "检测到 Ubuntu/Debian 系统"
    log_info "正在更新软件包列表..."
    sudo apt update

    log_info "正在安装 Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs

    log_info "正在安装 Git..."
    sudo apt install -y git
}

# 安装 Node.js (CentOS/RHEL)
install_node_centos() {
    log_info "检测到 CentOS/RHEL 系统"
    log_info "正在安装 Node.js 20.x..."
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo yum install -y nodejs git
}

# 安装 Node.js (macOS)
install_node_macos() {
    log_info "检测到 macOS 系统"
    
    # 检查是否安装了 Homebrew
    if ! command -v brew &> /dev/null; then
        log_info "正在安装 Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    log_info "正在安装 Node.js 和 Git..."
    brew install node git
}

# 验证安装
verify_installation() {
    log_info "验证安装..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js 安装成功: $NODE_VERSION"
    else
        log_error "Node.js 安装失败"
        exit 1
    fi
    
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        log_success "npm 安装成功: $NPM_VERSION"
    else
        log_error "npm 安装失败"
        exit 1
    fi
    
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        log_success "Git 安装成功: $GIT_VERSION"
    else
        log_error "Git 安装失败"
        exit 1
    fi
}

# 主函数
main() {
    echo "========================================"
    echo "  Node.js 自动安装脚本"
    echo "========================================"
    echo ""
    
    detect_os
    
    case $OS in
        ubuntu|debian)
            install_node_ubuntu
            ;;
        centos|rhel|fedora)
            install_node_centos
            ;;
        macos)
            install_node_macos
            ;;
        *)
            log_error "不支持的操作系统: $OS"
            exit 1
            ;;
    esac
    
    verify_installation
    
    echo ""
    echo "========================================"
    log_success "环境安装完成！"
    echo "========================================"
    echo ""
    echo "你可以运行以下命令验证:"
    echo "  node --version"
    echo "  npm --version"
    echo "  git --version"
    echo ""
}

# 运行主函数
main
