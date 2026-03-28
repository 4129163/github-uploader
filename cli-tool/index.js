#!/usr/bin/env node
/**
 * GitHub 自动上传工具 - CLI 版本
 * 修复版：支持环境变量配置路径
 */

const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');
const fs = require('fs-extra');
const path = require('path');
const { default: inquirer } = require('inquirer');
const os = require('os');

// =============================================================================
// 配置 - 修复硬编码路径问题
// =============================================================================

// 获取下载目录（优先级：环境变量 > 命令行参数 > 默认路径）
function getDownloadsDir() {
  // 1. 环境变量
  if (process.env.DOWNLOADS_DIR) {
    return process.env.DOWNLOADS_DIR;
  }
  
  // 2. 命令行参数
  const args = process.argv.slice(2);
  const dirArg = args.find(arg => arg.startsWith('--dir='));
  if (dirArg) {
    return dirArg.replace('--dir=', '');
  }
  
  // 3. 默认路径：脚本所在目录的 downloads
  return path.join(__dirname, 'downloads');
}

const DOWNLOADS_DIR = getDownloadsDir();
const TEMP_DIR = path.join(os.tmpdir(), 'github-uploader-temp');

// 颜色代码
const C = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// 工具函数
function printWelcome() {
  console.log(`${C.cyan}
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              🚀 GitHub 自动上传工具 v1.0.0                     ║
║                  OpenClaw 源码上传助手                         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝${C.reset}\n`);
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 检查资源文件
async function checkDownloads() {
  console.log(`${C.blue}📁 检查资源目录: ${DOWNLOADS_DIR}${C.reset}\n`);
  
  // 检查目录是否存在
  if (!await fs.pathExists(DOWNLOADS_DIR)) {
    console.log(`${C.red}✗ 资源目录不存在: ${DOWNLOADS_DIR}${C.reset}\n`);
    console.log(`${C.yellow}解决方法:${C.reset}`);
    console.log('  1. 创建目录: mkdir -p ' + DOWNLOADS_DIR);
    console.log('  2. 设置环境变量: export DOWNLOADS_DIR=/path/to/downloads');
    console.log('  3. 使用参数: npm start -- --dir=/path/to/downloads\n');
    return null;
  }
  
  const files = [
    '1-openclaw-main.zip', '2-openclaw-dashboard.zip', '3-openclaw-dashboard-alt.zip',
    '4-frontend.tar.gz', '5-backend-docs.tar.gz', '6-docker-deploy.tar.gz', '7-full-package.tar.gz'
  ];
  
  const existingFiles = [];
  
  for (const file of files) {
    const filePath = path.join(DOWNLOADS_DIR, file);
    if (await fs.pathExists(filePath)) {
      try {
        const stats = await fs.stat(filePath);
        existingFiles.push({ name: file, size: formatSize(stats.size), path: filePath });
        console.log(`${C.green} ✓ ${file.padEnd(30)} ${formatSize(stats.size).padStart(10)}${C.reset}`);
      } catch (err) {
        console.log(`${C.yellow} ⚠ ${file} (读取失败)${C.reset}`);
      }
    }
  }
  
  if (existingFiles.length === 0) {
    console.log(`${C.red}✗ 未找到任何资源文件${C.reset}\n`);
    console.log(`${C.yellow}请确保资源文件存在于: ${DOWNLOADS_DIR}${C.reset}\n`);
    console.log(`${C.blue}资源下载地址: https://github.com/4129163/openclaw-resources${C.reset}\n`);
    return null;
  }
  
  console.log(`${C.green}\n ✓ 共找到 ${existingFiles.length} 个资源文件${C.reset}\n`);
  return existingFiles;
}

// 获取 GitHub Token
async function getGitHubToken() {
  console.log(`${C.blue}🔐 GitHub 认证设置${C.reset}\n`);
  
  // 检查环境变量
  if (process.env.GITHUB_TOKEN) {
    console.log(`${C.green}✓ 从环境变量读取到 GitHub Token${C.reset}`);
    const { useEnvToken } = await inquirer.prompt([{
      type: 'confirm',
      name: 'useEnvToken',
      message: '是否使用环境变量中的 Token?',
      default: true
    }]);
    
    if (useEnvToken) {
      return process.env.GITHUB_TOKEN;
    }
  }
  
  console.log(`${C.yellow}请按以下步骤获取 GitHub Personal Access Token：${C.reset}`);
  console.log(' 1. 访问 https://github.com/settings/tokens');
  console.log(' 2. 点击 "Generate new token (classic)"');
  console.log(' 3. 勾选权限: repo (完全控制私有仓库)');
  console.log(' 4. 生成并复制 Token\n');
  
  const { token } = await inquirer.prompt([{
    type: 'password',
    name: 'token',
    message: '请输入 GitHub Personal Access Token:',
    mask: '*',
    validate: (input) => {
      if (!input || input.length === 0) return 'Token 不能为空';
      if (!input.startsWith('ghp_') && !input.startsWith('github_pat_')) {
        return 'Token 格式不正确，应以 ghp_ 或 github_pat_ 开头';
      }
      return true;
    }
  }]);
  
  return token;
}

// 验证 Token
async function verifyToken(token) {
  console.log(`${C.blue}正在验证 Token...${C.reset}`);
  
  try {
    const octokit = new Octokit({ auth: token });
    const { data: user } = await octokit.rest.users.getAuthenticated();
    
    console.log(`${C.green}✓ 认证成功！欢迎 ${user.login}${C.reset}\n`);
    return { octokit, user };
  } catch (error) {
    if (error.status === 401) {
      console.log(`${C.red}✗ Token 无效或已过期${C.reset}`);
      console.log(`${C.yellow}请检查 Token 是否正确，或重新生成${C.reset}\n`);
    } else if (error.status === 403) {
      console.log(`${C.red}✗ API 速率限制${C.reset}`);
      console.log(`${C.yellow}请稍后再试${C.reset}\n`);
    } else {
      console.log(`${C.red}✗ 验证失败: ${error.message}${C.reset}\n`);
    }
    return null;
  }
}

// 选择或创建仓库
async function selectRepository(octokit, user) {
  console.log(`${C.blue}📦 仓库设置${C.reset}\n`);
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: '请选择操作:',
    choices: [
      { name: '➕ 创建新仓库', value: 'create' },
      { name: '📂 使用现有仓库', value: 'existing' }
    ]
  }]);
  
  if (action === 'create') {
    const defaultName = process.env.DEFAULT_REPO_NAME || 'openclaw-resources';
    
    const { repoName, isPrivate } = await inquirer.prompt([
      {
        type: 'input',
        name: 'repoName',
        message: '请输入新仓库名称:',
        default: defaultName,
        validate: (input) => {
          if (!input || input.length === 0) return '仓库名称不能为空';
          if (!/^[a-zA-Z0-9._-]+$/.test(input)) return '仓库名称只能包含字母、数字、下划线、点和连字符';
          return true;
        }
      },
      {
        type: 'confirm',
        name: 'isPrivate',
        message: '是否设为私有仓库?',
        default: true
      }
    ]);
    
    console.log(`${C.blue}正在创建仓库: ${repoName}...${C.reset}`);
    
    try {
      const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
        name: repoName,
        description: 'OpenClaw 源码资源集合',
        private: isPrivate,
        auto_init: true
      });
      
      console.log(`${C.green}✓ 仓库创建成功: ${repo.html_url}${C.reset}\n`);
      return repo;
    } catch (error) {
      if (error.status === 422) {
        console.log(`${C.red}✗ 仓库创建失败: 仓库名称可能已存在${C.reset}\n`);
      } else {
        console.log(`${C.red}✗ 仓库创建失败: ${error.message}${C.reset}\n`);
      }
      return null;
    }
  } else {
    try {
      console.log(`${C.blue}正在获取仓库列表...${C.reset}`);
      const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({ 
        per_page: 100,
        sort: 'updated'
      });
      
      if (repos.length === 0) {
        console.log(`${C.yellow}没有现有仓库，将创建新仓库${C.reset}\n`);
        return selectRepository(octokit, user);
      }
      
      const { selectedRepo } = await inquirer.prompt([{
        type: 'list',
        name: 'selectedRepo',
        message: '选择要上传到的仓库:',
        choices: repos.map(r => ({
          name: `${r.full_name} ${r.private ? '🔒' : '🌐'}`,
          value: r
        }))
      }]);
      
      console.log(`${C.green}✓ 已选择仓库: ${selectedRepo.full_name}${C.reset}\n`);
      return selectedRepo;
    } catch (error) {
      console.log(`${C.red}✗ 获取仓库列表失败: ${error.message}${C.reset}\n`);
      return null;
    }
  }
}

// 准备上传文件
async function prepareFiles(files) {
  console.log(`${C.blue}📂 准备上传文件...${C.reset}\n`);
  
  try {
    await fs.remove(TEMP_DIR);
    await fs.ensureDir(TEMP_DIR);
    
    // 复制 README（如果存在）
    const readmePath = path.join(DOWNLOADS_DIR, '0-README.md');
    if (await fs.pathExists(readmePath)) {
      await fs.copy(readmePath, path.join(TEMP_DIR, 'README.md'));
      console.log(`${C.green} ✓ 已复制说明文档${C.reset}`);
    }
    
    // 创建资源目录
    const resourcesDir = path.join(TEMP_DIR, 'resources');
    await fs.ensureDir(resourcesDir);
    
    // 复制资源文件
    for (const file of files) {
      const destPath = path.join(resourcesDir, file.name);
      await fs.copy(file.path, destPath);
      console.log(`${C.green} ✓ 已复制 ${file.name}${C.reset}`);
    }
    
    console.log(`${C.green}\n ✓ 文件准备完成${C.reset}\n`);
    return TEMP_DIR;
  } catch (error) {
    console.log(`${C.red}✗ 文件准备失败: ${error.message}${C.reset}\n`);
    return null;
  }
}

// 上传到 GitHub
async function uploadToGitHub(repo, tempDir, user, token) {
  console.log(`${C.blue}☁️ 开始上传到 GitHub...${C.reset}\n`);
  
  const repoUrl = `https://${token}@github.com/${repo.full_name}.git`;
  const git = simpleGit(tempDir);
  
  try {
    await git.init();
    await git.addRemote('origin', repoUrl);
    
    const email = user.email || `${user.login}@users.noreply.github.com`;
    await git.addConfig('user.email', email);
    await git.addConfig('user.name', user.login);
    
    await git.add('.');
    console.log(`${C.green} ✓ 添加文件到暂存区${C.reset}`);
    
    await git.commit('📦 Upload OpenClaw resources');
    console.log(`${C.green} ✓ 创建提交${C.reset}`);
    
    const defaultBranch = repo.default_branch || 'main';
    await git.push('origin', `HEAD:${defaultBranch}`, ['--force']);
    console.log(`${C.green} ✓ 推送到 ${defaultBranch} 分支${C.reset}`);
    
    console.log(`${C.green}\n✅ 上传成功！${C.reset}\n`);
    return true;
  } catch (error) {
    if (error.message.includes('Could not resolve host')) {
      console.log(`${C.red}✗ 网络连接失败${C.reset}`);
      console.log(`${C.yellow}请检查网络连接或代理设置${C.reset}\n`);
    } else if (error.message.includes('Authentication failed')) {
      console.log(`${C.red}✗ 认证失败${C.reset}`);
      console.log(`${C.yellow}请检查 Token 是否有效${C.reset}\n`);
    } else {
      console.log(`${C.red}✗ 上传失败: ${error.message}${C.reset}\n`);
    }
    return false;
  }
}

// 清理临时文件
async function cleanup() {
  try {
    await fs.remove(TEMP_DIR);
  } catch (e) {}
}

// 主函数
async function main() {
  printWelcome();
  
  try {
    // 检查资源文件
    const files = await checkDownloads();
    if (!files) {
      process.exit(1);
    }
    
    // 获取并验证 Token
    const token = await getGitHubToken();
    const auth = await verifyToken(token);
    if (!auth) {
      process.exit(1);
    }
    
    // 选择仓库
    const repo = await selectRepository(auth.octokit, auth.user);
    if (!repo) {
      process.exit(1);
    }
    
    // 准备文件
    const tempDir = await prepareFiles(files);
    if (!tempDir) {
      process.exit(1);
    }
    
    // 上传
    const success = await uploadToGitHub(repo, tempDir, auth.user, token);
    await cleanup();
    
    if (success) {
      console.log(`${C.cyan}
╔═══════════════════════════════════════════════════════════════╗
║                    🎉 上传成功！                              ║
║                                                               ║
║  📎 仓库地址: ${repo.html_url.padEnd(46)} ║
║  🌐 访问链接: ${`https://github.com/${repo.full_name}`.padEnd(46)} ║
╚═══════════════════════════════════════════════════════════════╝${C.reset}
`);
    } else {
      process.exit(1);
    }
    
  } catch (error) {
    console.log(`${C.red}\n❌ 错误: ${error.message}${C.reset}\n`);
    await cleanup();
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error(`${C.red}未捕获的异常: ${error.message}${C.reset}`);
  cleanup().then(() => process.exit(1));
});

process.on('unhandledRejection', (reason) => {
  console.error(`${C.red}未处理的 Promise: ${reason}${C.reset}`);
});

// 运行
main();
