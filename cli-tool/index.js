#!/usr/bin/env node
/**
 * GitHub 自动上传工具 - CLI 版本
 * 用于将 OpenClaw 资源上传到 GitHub 仓库
 */

const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');
const fs = require('fs-extra');
const path = require('path');
const { default: inquirer } = require('inquirer');
const os = require('os');

// =============================================================================
// 配置
// =============================================================================

// 获取下载目录（支持环境变量、命令行参数、默认路径）
function getDownloadsDir() {
  // 优先级：环境变量 > 命令行参数 > 默认路径
  const args = process.argv.slice(2);
  const dirArg = args.find(arg => arg.startsWith('--dir='));
  
  if (dirArg) {
    return dirArg.replace('--dir=', '');
  }
  
  if (process.env.DOWNLOADS_DIR) {
    return process.env.DOWNLOADS_DIR;
  }
  
  // 默认路径：当前工作目录下的 downloads
  return path.join(process.cwd(), 'downloads');
}

const DOWNLOADS_DIR = getDownloadsDir();
const TEMP_DIR = path.join(os.tmpdir(), 'github-uploader-temp');

// 资源文件列表
const RESOURCE_FILES = [
  { name: '1-openclaw-main.zip', description: 'OpenClaw 主仓库' },
  { name: '2-openclaw-dashboard.zip', description: 'Dashboard 源码' },
  { name: '3-openclaw-dashboard-alt.zip', description: 'Dashboard 替代版本' },
  { name: '4-frontend.tar.gz', description: '前端源码' },
  { name: '5-backend-docs.tar.gz', description: '后端文档' },
  { name: '6-docker-deploy.tar.gz', description: 'Docker 配置' },
  { name: '7-full-package.tar.gz', description: '完整资源包' }
];

// =============================================================================
// 工具函数
// =============================================================================

// 颜色代码
const C = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

// 格式化文件大小
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 打印欢迎信息
function printWelcome() {
  console.log(`${C.cyan}
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              🚀 GitHub 自动上传工具 v1.0.0                     ║
║                  OpenClaw 源码上传助手                         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝${C.reset}\n`);
}

// 打印错误信息
function printError(message, details = '') {
  console.error(`${C.red}\n❌ 错误: ${message}${C.reset}`);
  if (details) {
    console.error(`${C.yellow}详情: ${details}${C.reset}`);
  }
}

// 打印成功信息
function printSuccess(message) {
  console.log(`${C.green}✓ ${message}${C.reset}`);
}

// 打印信息
function printInfo(message) {
  console.log(`${C.blue}ℹ ${message}${C.reset}`);
}

// 打印警告
function printWarning(message) {
  console.log(`${C.yellow}⚠ ${message}${C.reset}`);
}

// =============================================================================
// 核心功能
// =============================================================================

// 检查下载目录
async function checkDownloadsDir() {
  printInfo(`检查下载目录: ${DOWNLOADS_DIR}`);
  
  if (!await fs.pathExists(DOWNLOADS_DIR)) {
    printWarning(`下载目录不存在: ${DOWNLOADS_DIR}`);
    const { createDir } = await inquirer.prompt([{
      type: 'confirm',
      name: 'createDir',
      message: '是否创建该目录?',
      default: true
    }]);
    
    if (createDir) {
      await fs.ensureDir(DOWNLOADS_DIR);
      printSuccess(`已创建目录: ${DOWNLOADS_DIR}`);
    } else {
      printError('无法继续，请先准备资源文件');
      printInfo(`你可以:\n  1. 手动创建目录: mkdir -p ${DOWNLOADS_DIR}\n  2. 指定其他目录: --dir=/path/to/downloads\n  3. 设置环境变量: export DOWNLOADS_DIR=/path/to/downloads`);
      return null;
    }
  }
  
  return true;
}

// 检查资源文件
async function checkResources() {
  console.log(`\n${C.magenta}📁 扫描资源文件...${C.reset}\n`);
  
  const existingFiles = [];
  const missingFiles = [];
  
  for (const file of RESOURCE_FILES) {
    const filePath = path.join(DOWNLOADS_DIR, file.name);
    
    if (await fs.pathExists(filePath)) {
      try {
        const stats = await fs.stat(filePath);
        existingFiles.push({ 
          name: file.name, 
          description: file.description,
          size: formatSize(stats.size), 
          path: filePath 
        });
        console.log(`${C.green} ✓ ${file.name.padEnd(30)} ${formatSize(stats.size).padStart(10)}${C.reset}`);
      } catch (err) {
        printWarning(`无法读取文件 ${file.name}: ${err.message}`);
        missingFiles.push(file);
      }
    } else {
      missingFiles.push(file);
    }
  }
  
  console.log(`\n${C.cyan}─────────────────────────────────────────────────${C.reset}`);
  printInfo(`找到 ${existingFiles.length}/${RESOURCE_FILES.length} 个资源文件`);
  
  if (existingFiles.length === 0) {
    printError('没有找到任何资源文件');
    printInfo(`请将资源文件放入: ${DOWNLOADS_DIR}\n资源下载地址: https://github.com/4129163/openclaw-resources`);
    return null;
  }
  
  if (missingFiles.length > 0) {
    printWarning(`缺失 ${missingFiles.length} 个文件，将继续使用现有文件`);
  }
  
  return existingFiles;
}

// 获取 GitHub Token
async function getGitHubToken() {
  console.log(`\n${C.magenta}🔐 GitHub 认证设置${C.reset}\n`);
  
  // 检查环境变量
  if (process.env.GITHUB_TOKEN) {
    printInfo('从环境变量读取到 GitHub Token');
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
  console.log(' 3. 选择权限：\x1b[32mrepo\x1b[33m（完全控制私有仓库）');
  console.log(' 4. 生成并复制 Token\n');
  
  const { token } = await inquirer.prompt([{
    type: 'password',
    name: 'token',
    message: '请输入 GitHub Personal Access Token:',
    mask: '*',
    validate: (input) => {
      if (!input || input.length === 0) {
        return 'Token 不能为空';
      }
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
  printInfo('正在验证 Token...');
  
  try {
    const octokit = new Octokit({ auth: token });
    const { data: user } = await octokit.rest.users.getAuthenticated();
    
    printSuccess(`认证成功！欢迎 ${user.login}`);
    printInfo(`用户邮箱: ${user.email || '未公开'}`);
    
    return { octokit, user };
  } catch (error) {
    if (error.status === 401) {
      printError('Token 无效或已过期', '请检查 Token 是否正确，或重新生成');
    } else if (error.status === 403) {
      printError('API 速率限制', '请稍后再试');
    } else {
      printError('验证失败', error.message);
    }
    return null;
  }
}

// 选择或创建仓库
async function selectRepository(octokit, user) {
  console.log(`\n${C.magenta}📦 仓库设置${C.reset}\n`);
  
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
    
    const { repoName, description, isPrivate } = await inquirer.prompt([
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
        type: 'input',
        name: 'description',
        message: '仓库描述（可选）:',
        default: 'OpenClaw 源码资源集合'
      },
      {
        type: 'confirm',
        name: 'isPrivate',
        message: '是否设为私有仓库?',
        default: true
      }
    ]);
    
    printInfo(`正在创建仓库: ${repoName}...`);
    
    try {
      const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
        name: repoName,
        description: description,
        private: isPrivate,
        auto_init: true,
        gitignore_template: 'Node'
      });
      
      printSuccess(`仓库创建成功: ${repo.html_url}`);
      return repo;
    } catch (error) {
      if (error.status === 422) {
        printError('仓库创建失败', '仓库名称可能已存在或包含非法字符');
      } else {
        printError('仓库创建失败', error.message);
      }
      return null;
    }
  } else {
    try {
      printInfo('正在获取仓库列表...');
      const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({ 
        per_page: 100,
        sort: 'updated'
      });
      
      if (repos.length === 0) {
        printWarning('没有现有仓库，将创建新仓库');
        return selectRepository(octokit, user);
      }
      
      const { selectedRepo } = await inquirer.prompt([{
        type: 'list',
        name: 'selectedRepo',
        message: '选择要上传到的仓库:',
        choices: repos.map(r => ({
          name: `${r.full_name} ${r.private ? '🔒' : '🌐'} ${r.description || ''}`,
          value: r
        }))
      }]);
      
      printSuccess(`已选择仓库: ${selectedRepo.full_name}`);
      return selectedRepo;
    } catch (error) {
      printError('获取仓库列表失败', error.message);
      return null;
    }
  }
}

// 准备上传文件
async function prepareFiles(files) {
  console.log(`\n${C.magenta}📂 准备上传文件...${C.reset}\n`);
  
  try {
    // 清理并创建临时目录
    await fs.remove(TEMP_DIR);
    await fs.ensureDir(TEMP_DIR);
    
    // 复制 README（如果存在）
    const readmePath = path.join(DOWNLOADS_DIR, '0-README.md');
    if (await fs.pathExists(readmePath)) {
      await fs.copy(readmePath, path.join(TEMP_DIR, 'README.md'));
      printSuccess('已复制说明文档');
    }
    
    // 创建资源目录
    const resourcesDir = path.join(TEMP_DIR, 'resources');
    await fs.ensureDir(resourcesDir);
    
    // 复制资源文件
    for (const file of files) {
      const destPath = path.join(resourcesDir, file.name);
      await fs.copy(file.path, destPath);
      printSuccess(`已复制 ${file.name}`);
    }
    
    printSuccess('文件准备完成');
    return TEMP_DIR;
  } catch (error) {
    printError('文件准备失败', error.message);
    return null;
  }
}

// 上传到 GitHub
async function uploadToGitHub(repo, tempDir, user, token) {
  console.log(`\n${C.magenta}☁️ 开始上传到 GitHub...${C.reset}\n`);
  
  const repoUrl = `https://${token}@github.com/${repo.full_name}.git`;
  const git = simpleGit(tempDir);
  
  try {
    // 初始化 git
    printInfo('初始化 Git 仓库...');
    await git.init();
    await git.addRemote('origin', repoUrl);
    
    // 配置用户信息
    const email = user.email || `${user.login}@users.noreply.github.com`;
    await git.addConfig('user.email', email);
    await git.addConfig('user.name', user.login);
    
    // 添加文件
    printInfo('添加文件到暂存区...');
    await git.add('.');
    
    // 提交
    printInfo('创建提交...');
    await git.commit('📦 Upload OpenClaw resources\n\n自动上传 OpenClaw 相关资源文件');
    printSuccess('提交创建成功');
    
    // 推送
    const defaultBranch = repo.default_branch || 'main';
    printInfo(`推送到 ${defaultBranch} 分支...`);
    await git.push('origin', `HEAD:${defaultBranch}`, ['--force']);
    printSuccess('推送成功');
    
    return true;
  } catch (error) {
    if (error.message.includes('Could not resolve host')) {
      printError('网络连接失败', '请检查网络连接或代理设置');
    } else if (error.message.includes('Authentication failed')) {
      printError('认证失败', '请检查 Token 是否有效');
    } else {
      printError('上传失败', error.message);
    }
    return false;
  }
}

// 清理临时文件
async function cleanup() {
  try {
    await fs.remove(TEMP_DIR);
    printInfo('已清理临时文件');
  } catch (e) {
    // 忽略清理错误
  }
}

// 打印完成信息
function printCompletion(repo) {
  console.log(`
${C.green}╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                    🎉 上传成功！                              ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  📎 仓库地址: ${repo.html_url.padEnd(46)} ║
║  🌐 访问链接: ${`https://github.com/${repo.full_name}`.padEnd(46)} ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝${C.reset}

${C.cyan}✨ 你可以通过以下命令克隆仓库:${C.reset}
  git clone ${repo.clone_url}

${C.cyan}📖 资源说明:${C.reset}
  所有资源文件已上传到 resources/ 目录
`);
}

// =============================================================================
// 主函数
// =============================================================================

async function main() {
  printWelcome();
  
  try {
    // 检查下载目录
    if (!await checkDownloadsDir()) {
      process.exit(1);
    }
    
    // 检查资源文件
    const files = await checkResources();
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
    
    // 清理
    await cleanup();
    
    if (success) {
      printCompletion(repo);
    } else {
      process.exit(1);
    }
    
  } catch (error) {
    printError('程序运行出错', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    await cleanup();
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  printError('未捕获的异常', error.message);
  cleanup().then(() => process.exit(1));
});

process.on('unhandledRejection', (reason) => {
  printError('未处理的 Promise 拒绝', reason);
  cleanup().then(() => process.exit(1));
});

// 运行主程序
main();
