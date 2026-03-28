# 🔧 故障排查手册

遇到问题？先来这里查找解决方案！

---

## 🔍 问题快速定位

| 问题现象 | 可能原因 | 跳转章节 |
|---------|---------|---------|
| 命令行显示 "command not found" | 环境未安装 | [环境安装问题](#环境安装问题) |
| npm install 卡住不动 | 网络问题 | [网络问题](#网络问题) |
| 飞书机器人不回复 | 回调配置错误 | [飞书配置问题](#飞书配置问题) |
| GitHub 上传失败 | Token 权限不足 | [GitHub 问题](#github-问题) |
| 服务启动后无法访问 | 端口被占用 | [端口问题](#端口问题) |

---

## 环境安装问题

### 问题1: "node: command not found"

**现象**: 
```bash
$ node --version
bash: node: command not found
```

**解决方案**:

**Windows**:
1. 重新安装 Node.js，勾选 "Add to PATH"
2. 或手动添加环境变量：
   - 右键「此电脑」→「属性」→「高级系统设置」
   - 「环境变量」→ 编辑「Path」
   - 添加 `C:\Program Files\nodejs\`

**macOS/Linux**:
```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
export PATH="$PATH:/usr/local/bin"
source ~/.bashrc  # 或 source ~/.zshrc
```

---

### 问题2: npm install 权限错误

**现象**:
```bash
npm ERR! Error: EACCES: permission denied
```

**解决方案**:

**不要**使用 `sudo npm install`！

正确做法：
```bash
# 1. 修改 npm 默认目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# 2. 添加到 PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 3. 重新安装
npm install
```

---

## 网络问题

### 问题3: npm install 速度慢/失败

**现象**: 安装进度条卡住或超时

**解决方案1**: 更换 npm 镜像源
```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 或使用腾讯云镜像
npm config set registry https://mirrors.cloud.tencent.com/npm/

# 恢复官方源
npm config set registry https://registry.npmjs.org/
```

**解决方案2**: 使用代理
```bash
# 配置 npm 代理
npm config set proxy http://127.0.0.1:7890
npm config set https-proxy http://127.0.0.1:7890

# 取消代理
npm config delete proxy
npm config delete https-proxy
```

**解决方案3**: 使用 yarn 代替 npm
```bash
# 安装 yarn
npm install -g yarn

# 使用 yarn 安装（通常更快）
yarn install
```

---

### 问题4: 无法访问 GitHub

**现象**: git clone 失败或 timeout

**解决方案1**: 配置 Git 代理
```bash
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890
```

**解决方案2**: 使用镜像站
```bash
# GitHub 镜像
git clone https://ghproxy.com/https://github.com/4129163/github-uploader.git

# 或 Gitee 导入
# 访问 https://gitee.com/ 导入 GitHub 仓库
```

**解决方案3**: 修改 hosts 文件
```bash
# 查询 GitHub 最新 IP
# 访问 https://www.ipaddress.com/site/github.com

# Linux/macOS
sudo vim /etc/hosts
# Windows: C:\Windows\System32\drivers\etc\hosts

# 添加以下内容（IP 需要替换为实际查询结果）
140.82.114.4 github.com
140.82.114.4 api.github.com
```

---

## 飞书配置问题

### 问题5: 飞书回调验证失败

**现象**: 
```
challenge code verify failed
```

**排查步骤**:

1. **检查 URL 格式**
   - 必须是 `https://` 或 `http://` 开头
   - 不能以 `/` 结尾
   - 示例: `https://your-domain.com/api/webhook/feishu`

2. **测试回调地址**
```bash
curl -X POST https://your-domain.com/api/webhook/feishu \
  -H "Content-Type: application/json" \
  -d '{"challenge": "test123", "token": "verify_token"}'
```

应该返回:
```json
{"challenge": "test123"}
```

3. **检查防火墙**
```bash
# Ubuntu/Debian
sudo ufw status
sudo ufw allow 3000

# CentOS
sudo firewall-cmd --list-ports
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --reload
```

4. **检查云服务安全组**
   - 阿里云/腾讯云控制台
   - 添加 3000 端口入站规则

---

### 问题6: 机器人不回复消息

**排查清单**:

- [ ] 应用已发布并通过审核
- [ ] 机器人已添加到群聊
- [ ] 事件订阅 URL 配置正确
- [ ] 已申请 `im:message:send_as_bot` 权限
- [ ] 服务正在运行且能访问互联网

**查看日志**:
```bash
# 开发模式
npm run dev

# 查看详细日志
DEBUG=* npm run dev
```

---

### 问题7: 消息卡片不显示

**现象**: 机器人回复纯文本而不是卡片

**解决方案**:
1. 检查 `cards/upload-card.json` 文件是否存在
2. 检查 JSON 格式是否正确
3. 查看应用日志中的错误信息

**测试卡片格式**:
```bash
curl -X POST https://open.feishu.cn/open-apis/message/v4/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "your_chat_id",
    "msg_type": "interactive",
    "card": {
      "config": {"wide_screen_mode": true},
      "header": {
        "title": {"tag": "plain_text", "content": "测试卡片"}
      }
    }
  }'
```

---

## GitHub 问题

### 问题8: "401 Bad credentials"

**现象**: 
```
Error: 401 Bad credentials
```

**原因**: GitHub Token 无效或过期

**解决方案**:
1. 重新生成 Token:
   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 勾选 `repo` 权限
   - **立即复制**（只显示一次）

2. 检查 Token 权限:
   - 必须有 `repo` 权限
   - 如果启用了 2FA，必须使用 personal access token

3. 验证 Token:
```bash
curl -H "Authorization: token ghp_your_token" \
  https://api.github.com/user
```

---

### 问题9: "422 Validation Failed"

**现象**: 
```
Error: 422 Validation Failed
```

**原因**: 仓库名称不合法或已存在

**解决方案**:
- 仓库名只能包含：字母、数字、连字符 `-`、下划线 `_`
- 不能以连字符开头
- 检查是否已存在同名仓库

---

### 问题10: "403 API rate limit exceeded"

**现象**: 
```
Error: 403 API rate limit exceeded
```

**原因**: GitHub API 调用次数超限

**解决方案**:
- 未认证用户: 每小时 60 次
- 认证用户: 每小时 5000 次
- 等待一小时后重试
- 或更换 GitHub Token

---

## 端口问题

### 问题11: "Port 3000 is already in use"

**现象**: 
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**:

**查看占用端口的进程**:
```bash
# Linux/macOS
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

**终止进程**:
```bash
# Linux/macOS
kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

**更换端口**:
```bash
# 使用环境变量指定端口
PORT=3001 npm start
```

---

## 其他问题

### 问题12: TypeScript 编译错误

**现象**: 
```
error TS2304: Cannot find name 'xxx'
```

**解决方案**:
```bash
# 1. 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 2. 重新编译
npm run build
```

---

### 问题13: PM2 启动失败

**现象**: 
```
PM2 error: Script not found
```

**解决方案**:
```bash
# 1. 确保已编译
npm run build

# 2. 检查 ecosystem.config.js 路径
ls -la dist/main.js

# 3. 使用绝对路径
pm2 start $(pwd)/ecosystem.config.js
```

---

## 获取帮助

如果以上方案都无法解决你的问题：

1. **查看日志**
```bash
# 应用日志
npm run dev 2>&1 | tee app.log

# PM2 日志
pm2 logs

# 系统日志
journalctl -u pm2-root
```

2. **提交 Issue**
   - 访问: https://github.com/4129163/github-uploader/issues
   - 提供以下信息：
     - 操作系统版本
     - Node.js 版本 (`node --version`)
     - 完整的错误日志
     - 复现步骤

3. **加入交流群**
   - 飞书群：扫描下方二维码
   - 微信群：联系管理员

---

## 故障排查速查表

```bash
# 1. 检查环境
node --version && npm --version && git --version

# 2. 检查网络
curl -I https://github.com

# 3. 检查端口
lsof -i :3000 || echo "Port 3000 is free"

# 4. 检查防火墙
sudo ufw status || sudo firewall-cmd --list-ports

# 5. 测试飞书回调
curl -X POST http://localhost:3000/api/webhook/feishu \
  -d '{"challenge": "test"}'

# 6. 测试 GitHub API
curl -H "Authorization: token $TOKEN" \
  https://api.github.com/user
```
