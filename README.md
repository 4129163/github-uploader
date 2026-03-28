# 🚀 GitHub 自动上传工具

> 🎯 **一句话介绍**: 一键将 OpenClaw 源码自动上传到你的 GitHub 账号，支持飞书交互和命令行两种方式！

---

## 📚 阅读指南

| 读者类型 | 推荐阅读部分 |
|---------|-------------|
| 👶 **纯小白** | 第1、2、3章（设备选择 → 环境准备 → 快速开始） |
| 👨‍💻 **开发者** | 第4、5章（飞书应用部署 → CLI 工具使用） |
| 🔧 **专业人员** | 第6、7章（架构说明 → API 文档） |

---

## 📁 项目结构

```
github-uploader/
├── 📁 cli-tool/              # 命令行工具（适合个人使用）
│   ├── index.js              # 主程序
│   ├── package.json          # 依赖配置
│   ├── .gitignore            # Git 忽略配置
│   └── README.md             # CLI 工具说明
│
├── 📁 feishu-app/            # 飞书应用（适合团队协作）
│   ├── src/                  # 源码目录
│   │   ├── main.ts           # 入口文件
│   │   ├── app.module.ts     # 模块配置
│   │   ├── feishu.service.ts # 飞书服务
│   │   ├── github-upload.service.ts # GitHub 上传服务
│   │   └── upload.controller.ts     # 上传接口
│   ├── cards/                # 消息卡片模板
│   │   └── upload-card.json
│   ├── package.json          # 依赖配置
│   ├── tsconfig.json         # TypeScript 配置
│   └── README.md             # 飞书应用说明
│
└── README.md                 # 本文件
```

---

## 第1章：设备选择 💻

### 1.1 部署方式对比

| 方式 | 适用场景 | 难度 | 成本 |
|------|---------|------|------|
| **本地电脑** | 个人测试、学习 | ⭐ 简单 | 免费 |
| **云服务器** | 团队使用、长期运行 | ⭐⭐ 中等 | ~50元/月 |
| **飞书云函数** | 无服务器部署 | ⭐⭐⭐ 较难 | 按量付费 |

### 1.2 硬件要求

**最低配置**:
- CPU: 1核
- 内存: 1GB
- 硬盘: 5GB
- 网络: 能访问 GitHub

**推荐配置**:
- CPU: 2核+
- 内存: 2GB+
- 硬盘: 10GB+
- 带宽: 5Mbps+

### 1.3 云服务器购买教程

**推荐服务商**:
- 国内: [阿里云](https://www.aliyun.com/)、[腾讯云](https://cloud.tencent.com/)、[华为云](https://www.huaweicloud.com/)
- 国外: [AWS](https://aws.amazon.com/)、[Vultr](https://www.vultr.com/)、[DigitalOcean](https://www.digitalocean.com/)

**购买步骤（以阿里云为例）**:

1. 访问 [阿里云 ECS 购买页](https://ecs-buy.aliyun.com/)
2. 选择配置：
   - 地域: 选择离你最近的
   - 实例: 共享标准型 s6 2核2G
   - 镜像: Ubuntu 22.04 64位
   - 带宽: 5Mbps
   - 购买时长: 1个月（新用户有优惠）
3. 设置安全组：开放端口 22(SSH)、3000(应用)、80/443(HTTP/HTTPS)
4. 设置登录密码或密钥
5. 支付创建实例
6. 记录公网 IP 地址

---

## 第2章：环境准备 🛠️

### 2.1 必须安装的软件

| 软件 | 版本要求 | 用途 | 下载链接 |
|------|---------|------|----------|
| Node.js | >= 18.x | 运行 JavaScript | [官网下载](https://nodejs.org/) |
| npm | >= 9.x | 包管理 | 随 Node.js 安装 |
| Git | >= 2.x | 版本控制 | [官网下载](https://git-scm.com/) |

### 2.2 环境安装详细教程

#### 🪟 Windows 系统

**步骤1：安装 Node.js**
1. 打开浏览器访问 https://nodejs.org/
2. 点击 **LTS**（长期支持版，绿色按钮）下载
3. 双击下载的安装包
4. 安装向导中：
   - ✅ 勾选 "Automatically install the necessary tools"
   - 其他保持默认，点击 Next
5. 安装完成后，打开 PowerShell 或 CMD
6. 验证安装：
```powershell
node --version
# 应显示类似: v20.11.0

npm --version
# 应显示类似: 10.2.4
```

**步骤2：安装 Git**
1. 访问 https://git-scm.com/download/win
2. 下载 64-bit Git for Windows Setup
3. 安装时：
   - 选择 "Use Git from the Windows Command Prompt"
   - 其他保持默认
4. 验证安装：
```powershell
git --version
```

**步骤3：安装 VS Code（推荐编辑器）**
1. 访问 https://code.visualstudio.com/
2. 下载安装包
3. 安装时勾选 "Add to PATH"

#### 🍎 macOS 系统

**方式一：使用 Homebrew（推荐）**
```bash
# 1. 安装 Homebrew（如果还没有）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 安装 Node.js 和 Git
brew install node git

# 3. 验证安装
node --version
npm --version
git --version
```

**方式二：使用安装包**
- Node.js: 从 https://nodejs.org/ 下载 `.pkg` 安装包
- Git: macOS 通常自带，或从 https://git-scm.com/download/mac 下载

#### 🐧 Linux 系统（Ubuntu/Debian）

```bash
# 1. 更新软件源
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 安装 Git
sudo apt install -y git

# 4. 验证安装
node --version
npm --version
git --version
```

### 2.3 网络环境配置

由于需要访问 GitHub，可能需要配置代理：

```bash
# 配置 Git 代理（如果需要）
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 配置 npm 代理
npm config set proxy http://127.0.0.1:7890
npm config set https-proxy http://127.0.0.1:7890

# 取消代理
# git config --global --unset http.proxy
# npm config delete proxy
```

---

## 第3章：快速开始 🚀

### 3.1 下载本项目

```bash
# 克隆仓库
git clone https://github.com/4129163/github-uploader.git

# 进入目录
cd github-uploader
```

### 3.2 选择使用方式

本项目提供两种使用方式：

| 方式 | 适合谁 | 特点 |
|------|-------|------|
| **CLI 工具** | 个人用户 | 命令行操作，简单直接 |
| **飞书应用** | 团队用户 | 交互式界面，协作方便 |

---

## 第4章：CLI 工具使用（个人用户）💻

### 4.1 快速部署

```bash
# 1. 进入 CLI 工具目录
cd cli-tool

# 2. 安装依赖
npm install

# 3. 运行工具
npm start
```

### 4.2 使用教程

**首次使用步骤**：

1. **获取 GitHub Token**
   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 勾选权限:
     - ✅ `repo` - 完全控制私有仓库
     - ✅ `workflow` - 更新 GitHub Actions 工作流
   - 点击 "Generate token"
   - **立即复制 Token**（只显示一次！）

2. **运行上传工具**
```bash
npm start
```

3. **按提示操作**
   - 输入 GitHub Token
   - 输入仓库名称（如：my-openclaw-resources）
   - 选择要上传的文件
   - 等待上传完成

4. **查看结果**
   - 工具会自动打开浏览器显示你的仓库
   - 或在 GitHub 上访问 `https://github.com/你的用户名/仓库名`

### 4.3 CLI 命令说明

```bash
# 启动交互式上传
npm start

# 或直接运行
node index.js
```

---

## 第5章：飞书应用部署（团队用户）💬

### 5.1 前置条件

- 已安装 Node.js >= 18
- 有一个飞书企业账号（或个人开发者账号）
- 有一个公网可访问的服务器（或内网穿透工具）

### 5.2 部署步骤

#### 步骤1：下载并安装依赖

```bash
# 1. 进入飞书应用目录
cd feishu-app

# 2. 安装依赖
npm install

# 3. 编译 TypeScript
npm run build
```

#### 步骤2：创建飞书应用

1. **访问飞书开发者后台**
   - 打开 https://open.feishu.cn/app
   - 登录你的飞书账号

2. **创建企业自建应用**
   - 点击「创建企业自建应用」
   - 填写应用名称："GitHub 上传助手"
   - 填写应用描述："一键上传代码到 GitHub"
   - 上传应用图标（可选）
   - 点击「确定创建」

3. **获取凭证信息**
   - 在「凭证与基础信息」页面
   - 复制 **App ID** 和 **App Secret**
   - 保存好，等会要用

4. **开启机器人能力**
   - 点击左侧「添加应用能力」
   - 找到「机器人」卡片
   - 点击「配置」→ 开启机器人

5. **配置权限**
   - 点击「权限管理」
   - 搜索并添加以下权限：
     - ✅ `im:chat:readonly` - 获取群组信息
     - ✅ `im:message.group_msg` - 发送群消息
     - ✅ `im:message:send_as_bot` - 以机器人身份发送消息
     - ✅ `card:action.trigger` - 处理卡片交互事件
   - 点击「批量申请」等待审批

6. **配置事件订阅**
   - 点击「事件订阅」
   - 开启「启用事件」开关
   - 配置请求地址：`https://你的域名/api/webhook/feishu`
   - 如果没有域名，可以使用内网穿透（见 5.3 节）
   - 添加事件：
     - `im.message.receive_v1` - 接收消息
     - `card.action.trigger` - 卡片交互

7. **发布应用**
   - 点击「版本管理与发布」
   - 点击「创建版本」
   - 填写版本号：1.0.0
   - 填写更新说明：初始版本
   - 点击「保存」
   - 点击「申请发布」
   - 让管理员审批通过

#### 步骤3：配置应用代码

编辑 `src/feishu.service.ts`：

```typescript
// 第10-11行，替换为你的凭证
private readonly APP_ID = 'cli_xxxxxxxxxxxxxxxx';
private readonly APP_SECRET = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

编辑 `src/github-upload.service.ts`：

```typescript
// 第15行，可选：配置默认 GitHub Token
private defaultToken = process.env.GITHUB_TOKEN || '';
```

#### 步骤4：启动服务

**开发模式（本地测试）**：
```bash
npm run dev
```

**生产模式**：
```bash
npm run build
npm start
```

服务默认运行在 `http://localhost:3000`

#### 步骤5：配置内网穿透（无服务器时）

如果你没有公网服务器，可以使用 ngrok：

```bash
# 1. 安装 ngrok
npm install -g ngrok

# 2. 注册 ngrok 账号并获取 authtoken
# 访问 https://dashboard.ngrok.com/get-started/your-authtoken

# 3. 配置 authtoken
ngrok config add-authtoken 你的_token

# 4. 启动内网穿透
ngrok http 3000

# 5. 复制生成的 https 地址（如 https://xxxx.ngrok.io）
# 6. 在飞书后台将事件订阅地址改为: https://xxxx.ngrok.io/api/webhook/feishu
```

#### 步骤6：使用应用

1. **添加机器人到群聊**
   - 在飞书中打开任意群聊
   - 点击右上角「设置」→「群机器人」
   - 点击「添加机器人」
   - 找到「GitHub 上传助手」
   - 点击「添加」

2. **触发上传**
   - 在群中 @机器人
   - 机器人会回复一个交互式卡片
   - 点击「🚀 开始上传」按钮
   - 在弹出的对话框中输入：
     - GitHub Token
     - 仓库名称
   - 点击确认，等待上传完成

3. **查看结果**
   - 卡片会显示上传进度
   - 上传成功后会显示仓库链接
   - 点击链接即可查看上传的文件

### 5.3 飞书应用配置检查清单

- [ ] 已创建飞书企业自建应用
- [ ] 已获取 App ID 和 App Secret
- [ ] 已开启机器人能力
- [ ] 已申请所需权限
- [ ] 已配置事件订阅地址
- [ ] 已发布应用版本
- [ ] 已将机器人添加到群聊
- [ ] 已配置正确的回调地址

---

## 第6章：架构说明（专业人员）🏗️

### 6.1 系统架构图

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   用户（飞书）   │────▶│  GitHub上传服务   │────▶│  GitHub API    │
│                 │     │                  │     │                 │
│ • 发送消息      │     │ • NestJS 服务     │     │ • 创建仓库      │
│ • 点击卡片      │     │ • 飞书 SDK       │     │ • 上传文件      │
│ • 输入Token    │     │ • Octokit        │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐     ┌──────────────────┐
│  飞书开放平台   │     │   本地/云服务器   │
│                 │     │                  │
│ • 消息推送      │     │ • Node.js 18+    │
│ • 卡片渲染      │     │ • 3000端口       │
│ • 事件回调      │     │ • 公网可访问     │
└─────────────────┘     └──────────────────┘
```

### 6.2 数据流

1. 用户在飞书群 @机器人
2. 飞书服务器推送消息到配置的回调地址
3. 应用接收消息，生成交互式卡片
4. 用户点击卡片按钮，触发事件回调
5. 应用接收事件，调用 GitHub API 创建仓库
6. 应用将本地资源上传到 GitHub 仓库
7. 上传完成后，更新卡片显示结果

### 6.3 目录结构详解

```
feishu-app/
├── src/
│   ├── main.ts                    # 应用入口
│   │   └── 创建 NestJS 应用实例
│   │
│   ├── app.module.ts              # 根模块
│   │   └── 注册所有服务和控制器
│   │
│   ├── feishu.service.ts          # 飞书服务
│   │   ├── App ID / Secret 配置
│   │   ├── 发送消息卡片
│   │   └── 处理飞书事件
│   │
│   ├── github-upload.service.ts   # GitHub 上传服务
│   │   ├── Octokit 客户端初始化
│   │   ├── 创建仓库
│   │   ├── 上传文件
│   │   └── 错误处理
│   │
│   └── upload.controller.ts       # 上传控制器
│       ├── POST /api/upload       # 手动上传接口
│       └── POST /api/webhook/feishu  # 飞书回调
│
├── cards/
│   └── upload-card.json           # 飞书消息卡片模板
│
├── package.json                   # 项目依赖
│   ├── @nestjs/*                  # NestJS 框架
│   ├── @larksuiteoapi/node-sdk    # 飞书 SDK
│   ├── @octokit/rest              # GitHub API
│   └── simple-git                 # Git 操作
│
└── tsconfig.json                  # TypeScript 配置
```

---

## 第7章：API 文档 📚

### 7.1 接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/upload` | 手动触发上传 |
| POST | `/api/webhook/feishu` | 飞书事件回调 |
| GET | `/health` | 健康检查 |

### 7.2 手动上传接口

**请求**：
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ghp_xxxxxxxxxxxxxxxxxxxx",
    "repoName": "my-resources",
    "files": ["1-openclaw-main.zip"]
  }'
```

**响应**：
```json
{
  "success": true,
  "repoUrl": "https://github.com/username/my-resources",
  "files": ["1-openclaw-main.zip"],
  "message": "上传成功"
}
```

### 7.3 环境变量配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `PORT` | 服务端口 | 3000 |
| `GITHUB_TOKEN` | 默认 GitHub Token | ghp_xxx |
| `FEISHU_APP_ID` | 飞书 App ID | cli_xxx |
| `FEISHU_APP_SECRET` | 飞书 App Secret | xxx |

创建 `.env` 文件：
```bash
PORT=3000
GITHUB_TOKEN=ghp_your_token_here
FEISHU_APP_ID=cli_your_app_id
FEISHU_APP_SECRET=your_app_secret
```

---

## 第8章：故障排查 🔧

### 8.1 常见问题

#### Q1: npm install 失败
**错误信息**: `ERR! code ENOENT`

**解决方案**:
```bash
# 1. 清除 npm 缓存
npm cache clean --force

# 2. 删除 node_modules
rm -rf node_modules package-lock.json

# 3. 重新安装
npm install
```

#### Q2: 飞书回调验证失败
**错误信息**: `challenge code verify failed`

**解决方案**:
1. 检查事件订阅 URL 是否正确
2. 确保服务器能接收 POST 请求
3. 检查防火墙是否放行端口
4. 使用 `curl` 测试回调地址：
```bash
curl -X POST http://你的地址/api/webhook/feishu \
  -H "Content-Type: application/json" \
  -d '{"challenge": "test"}'
```

#### Q3: GitHub 上传失败
**错误信息**: `401 Bad credentials`

**解决方案**:
1. 检查 Token 是否正确复制
2. 确认 Token 有 `repo` 权限
3. 如果启用了 2FA，需要创建 personal access token

#### Q4: 飞书卡片不显示
**错误信息**: 机器人回复了纯文本

**解决方案**:
1. 检查 `cards/upload-card.json` 文件是否存在
2. 确认卡片 JSON 格式正确
3. 查看应用日志获取详细错误

### 8.2 日志查看

```bash
# 开发模式日志
npm run dev

# 生产模式日志
npm start 2>&1 | tee app.log

# 查看最后100行日志
tail -f app.log
```

### 8.3 联系支持

- 在 [GitHub Issues](https://github.com/4129163/github-uploader/issues) 提交问题
- 提供以下信息：
  - 操作系统版本
  - Node.js 版本 (`node --version`)
  - 错误截图或日志
  - 复现步骤

---

## 📄 许可证

MIT License

---

## 🤝 贡献指南

欢迎提交 PR！请确保：
1. 代码通过 ESLint 检查
2. 提交信息清晰明确
3. 更新相关文档

---

## 🔗 相关链接

- 📦 资源仓库: https://github.com/4129163/openclaw-resources
- 📖 OpenClaw 文档: https://docs.openclaw.ai
- 🐦 飞书开放平台: https://open.feishu.cn
- 🐙 GitHub API: https://docs.github.com/en/rest
