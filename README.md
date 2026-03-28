# 🚀 GitHub 自动上传工具

> 将 OpenClaw 及相关源码自动上传到你的 GitHub 仓库

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/4129163/github-uploader)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg)](https://nodejs.org/)

## 📖 项目介绍

本工具帮助你快速将 OpenClaw 项目的源码资源上传到你自己的 GitHub 仓库，方便：

- 🔄 备份重要源码资源
- 📤 分享给你的团队或朋友
- 🌍 在任何地方快速访问
- 🛠️ 作为新项目的基础模板

## ✨ 功能特点

- 🎯 **智能识别** - 自动检测本地资源文件
- 🔐 **安全上传** - 使用 GitHub Personal Access Token，安全可靠
- 📦 **多文件支持** - 支持上传多个资源包
- 🚀 **自动创建** - 可自动创建新仓库或选择现有仓库
- 📝 **详细日志** - 实时显示上传进度和结果
- 💻 **双模式支持** - CLI 命令行 + 飞书机器人

## 📦 资源列表

| 文件名 | 大小 | 说明 |
|--------|------|------|
| 1-openclaw-main.zip | ~40MB | OpenClaw 主仓库源码 |
| 2-openclaw-dashboard.zip | ~1.3MB | Dashboard 源码 |
| 3-openclaw-dashboard-alt.zip | ~1.7MB | Dashboard 替代版本 |
| 4-frontend.tar.gz | ~489KB | 前端源码 |
| 5-backend-docs.tar.gz | ~11MB | 后端文档 |
| 6-docker-deploy.tar.gz | ~7KB | Docker 配置 |
| 7-full-package.tar.gz | ~35MB | 完整资源包 |

## 🚀 快速开始

### 选择适合你的方式

| 方式 | 适用场景 | 难度 |
|------|----------|------|
| [🚀 一键脚本部署](#方式一一键脚本部署推荐) | 快速上手 | ⭐ |
| [💻 CLI 工具](#方式二cli-工具) | 个人使用 | ⭐⭐ |
| [📱 飞书应用](#方式三飞书应用) | 团队协作 | ⭐⭐⭐ |

---

## 方式一：一键脚本部署（推荐）

### 1. 自动安装

**Linux/macOS:**
```bash
curl -fsSL https://raw.githubusercontent.com/4129163/github-uploader/main/deploy-scripts/deploy-cli.sh | bash
```

**Windows (PowerShell 管理员):**
```powershell
irm https://raw.githubusercontent.com/4129163/github-uploader/main/deploy-scripts/deploy-cli.bat | iex
```

### 2. 运行工具

```bash
cd github-uploader/cli-tool
npm start
```

---

## 方式二：CLI 工具

### 环境要求

- ✅ Node.js >= 16.0.0
- ✅ npm >= 8.0.0
- ✅ Git >= 2.0.0

### 安装步骤

#### 1. 克隆本仓库

```bash
git clone https://github.com/4129163/github-uploader.git
cd github-uploader/cli-tool
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 准备资源文件

将下载的 OpenClaw 资源文件放入 `downloads/` 目录：

```bash
mkdir -p downloads
cp /path/to/your/downloads/*.zip downloads/
cp /path/to/your/downloads/*.tar.gz downloads/
```

> 💡 **资源下载**: 如果没有资源文件，请先从 [openclaw-resources](https://github.com/4129163/openclaw-resources) 下载

#### 4. 运行上传工具

```bash
npm start
```

#### 5. 按照提示操作

1. **输入 GitHub Token** - 按提示获取并输入
2. **选择仓库** - 创建新仓库或选择已有仓库
3. **等待上传** - 工具会自动完成上传

---

## 方式三：飞书应用

### 适用于团队协作场景

飞书应用允许你在飞书群中直接上传资源，无需本地操作。

### 部署步骤

#### 1. 服务器准备

需要一台可以访问互联网的服务器（推荐云服务器）

#### 2. 一键部署

```bash
curl -fsSL https://raw.githubusercontent.com/4129163/github-uploader/main/deploy-scripts/deploy-feishu.sh | bash
```

#### 3. 配置飞书应用

1. 访问 [飞书开放平台](https://open.feishu.cn/app)
2. 创建企业自建应用
3. 获取 **App ID** 和 **App Secret**
4. 设置环境变量：
   ```bash
   export FEISHU_APP_ID=your_app_id
   export FEISHU_APP_SECRET=your_app_secret
   ```
5. 启动服务

详细配置请参考 [飞书应用部署文档](docs/TUTORIAL.md)

---

## 🔐 获取 GitHub Token

### 步骤：

1. 访问 [GitHub Token 设置](https://github.com/settings/tokens)
2. 点击 **"Generate new token (classic)"**
3. 填写 Token 名称（如："Uploader"）
4. 勾选权限：
   - ✅ `repo` - 完全控制私有仓库
   - ✅ `workflow` - 更新 GitHub Action 工作流
5. 点击 **"Generate token"**
6. **复制并保存 Token**（只显示一次）

> ⚠️ **安全提示**: Token 相当于密码，请勿分享给他人！

---

## 🛠️ 高级配置

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DOWNLOADS_DIR` | 资源文件目录 | `./downloads` |
| `GITHUB_TOKEN` | GitHub Token | 交互式输入 |
| `DEFAULT_REPO_NAME` | 默认仓库名 | `openclaw-resources` |

### 使用自定义目录

```bash
# Linux/macOS
export DOWNLOADS_DIR=/path/to/your/downloads
npm start

# Windows
set DOWNLOADS_DIR=C:\path\to\your\downloads
npm start
```

---

## 🐛 故障排查

### 问题 1：找不到资源文件

**症状**: 程序提示 "未找到已下载的资源文件"

**解决**:
1. 确认资源文件存在
2. 检查 `DOWNLOADS_DIR` 路径设置
3. 使用绝对路径

### 问题 2：Token 验证失败

**症状**: "Token 验证失败: Bad credentials"

**解决**:
1. 检查 Token 是否完整复制
2. 确认 Token 未过期
3. 重新生成 Token

### 问题 3：仓库创建失败

**症状**: "仓库创建失败: name already exists"

**解决**:
1. 更换仓库名称
2. 选择使用现有仓库
3. 删除已有的同名仓库

### 问题 4：上传失败

**症状**: "上传失败: Could not resolve host"

**解决**:
1. 检查网络连接
2. 配置代理（如需要）
3. 重试上传

---

## 📚 文档目录

| 文档 | 说明 |
|------|------|
| [📖 TUTORIAL.md](docs/TUTORIAL.md) | 详细教程视频脚本 |
| [🔧 TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | 故障排查手册 |
| [🚀 部署脚本](deploy-scripts/) | 一键部署脚本 |

---

## 🤝 相关项目

| 项目 | 说明 |
|------|------|
| [openclaw-resources](https://github.com/4129163/openclaw-resources) | OpenClaw 资源仓库 |
| [github-deploy-assistant](https://github.com/4129163/github-deploy-assistant) | GitHub 项目智能部署助手 |

---

## 📝 更新日志

### v1.0.0 (2024-XX-XX)

- ✨ 初始版本发布
- 🎯 支持 CLI 和飞书两种模式
- 🔐 安全的 Token 处理
- 📦 支持多文件上传

---

## 📄 许可证

[MIT](LICENSE)

---

**Made with ❤️ by GitHub Uploader Team**
