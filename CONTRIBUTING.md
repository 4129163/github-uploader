# 贡献指南

感谢你对 GitHub Uploader 项目的关注！以下是参与贡献的指南。

## 如何贡献

### 报告问题

如果你发现了 bug 或有功能建议，请通过 [GitHub Issues](https://github.com/4129163/github-uploader/issues) 提交。

提交问题时请包含：
- 问题描述
- 复现步骤
- 期望行为
- 实际行为
- 环境信息（操作系统、Node.js 版本等）
- 错误日志或截图

### 提交代码

1. **Fork 仓库**
   ```bash
   git clone https://github.com/你的用户名/github-uploader.git
   cd github-uploader
   ```

2. **创建分支**
   ```bash
   git checkout -b feature/你的功能名称
   ```

3. **安装依赖**
   ```bash
   cd cli-tool && npm install
   cd ../feishu-app && npm install
   ```

4. **进行修改**
   - 遵循现有的代码风格
   - 添加必要的注释
   - 更新相关文档

5. **测试**
   ```bash
   # CLI 工具测试
   cd cli-tool
   npm start
   
   # 飞书应用测试
   cd feishu-app
   npm run dev
   ```

6. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 描述你的更改"
   git push origin feature/你的功能名称
   ```

7. **创建 Pull Request**
   - 描述你的更改
   - 关联相关的 Issue
   - 等待审核

## 代码规范

### JavaScript/TypeScript

- 使用 2 空格缩进
- 使用单引号
- 语句末尾使用分号
- 函数使用驼峰命名法
- 常量使用全大写蛇形命名法

### 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复问题
- `docs`: 文档更新
- `style`: 代码格式（不影响功能的更改）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

示例：
```
feat: 添加自动下载资源功能
fix: 修复 Windows 路径分隔符问题
docs: 更新 README 安装说明
```

## 开发环境设置

### 必需软件

- Node.js >= 18.x
- npm >= 9.x
- Git >= 2.x

### 推荐工具

- VS Code
- ESLint 插件
- Prettier 插件

### VS Code 配置

创建 `.vscode/settings.json`：

```json
{
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## 项目结构

```
github-uploader/
├── cli-tool/          # CLI 工具
├── feishu-app/        # 飞书应用
├── deploy-scripts/    # 部署脚本
├── docs/              # 文档
└── README.md          # 主文档
```

## 联系方式

- GitHub Issues: https://github.com/4129163/github-uploader/issues
- 邮箱: your-email@example.com

## 行为准则

- 尊重所有参与者
- 接受建设性的批评
- 关注对社区最有利的事情
- 展现同理心

感谢你的贡献！
