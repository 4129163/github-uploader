# 🚀 飞书妙搭 GitHub 自动上传应用

飞书消息卡片应用，可以在飞书内一键将 OpenClaw 源码上传到你的 GitHub 仓库。

## 📋 功能特点

- 🎯 飞书交互式卡片界面
- 🚀 一键上传 OpenClaw 源码
- 🔐 安全的 Token 处理
- 📊 实时上传状态反馈
- 🔗 自动打开仓库链接

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置飞书应用

1. 访问 [飞书开发者后台](https://open.feishu.cn/app)
2. 创建企业自建应用
3. 获取 **App ID** 和 **App Secret**
4. 修改 `src/feishu.service.ts` 中的凭证
5. 添加应用能力 → 开启**机器人**
6. 权限管理 → 申请 `im:message:send_as_bot` 权限
7. 事件订阅 → 配置回调地址 `https://你的域名/api/webhook/feishu`

### 3. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

### 4. 使用应用

1. 在飞书群中添加机器人
2. @机器人发送任意消息
3. 点击卡片中的 "🚀 开始上传" 按钮
4. 输入 GitHub Token 和仓库名称
5. 等待上传完成

## 🔐 权限要求

### GitHub Token 权限

需要 `repo` 权限来创建仓库和推送代码。

### 飞书应用权限

- `im:message:send_as_bot` - 发送消息
- `im:message.group_msg` - 发送群消息
- `card:action.trigger` - 卡片交互回调

## 📁 上传的资源

| 文件名 | 大小 | 说明 |
|--------|------|------|
| 1-openclaw-main.zip | ~40MB | OpenClaw 主仓库 |
| 2-openclaw-dashboard.zip | ~1.3MB | Dashboard 源码 |
| 3-openclaw-dashboard-alt.zip | ~1.7MB | Dashboard 另一版本 |
| 4-frontend.tar.gz | ~489KB | 前端源码 |
| 5-backend-docs.tar.gz | ~11MB | 后端文档 |
| 6-docker-deploy.tar.gz | ~7KB | Docker 配置 |
| 7-full-package.tar.gz | ~35MB | 完整资源包 |

## 🛠️ 技术栈

- NestJS - Node.js 框架
- @larksuiteoapi/node-sdk - 飞书 SDK
- @octokit/rest - GitHub API
- simple-git - Git 操作

## 📄 许可证

MIT
