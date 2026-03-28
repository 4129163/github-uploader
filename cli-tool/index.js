#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');
const fs = require('fs-extra');
const path = require('path');
const { default: inquirer } = require('inquirer');

const DOWNLOADS_DIR = '/home/gem/workspace/agent/downloads';

// 颜色代码
const C = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function printWelcome() {
  console.log(`${C.cyan}
╔════════════════════════════════════════════════════════╗
║      🚀 GitHub 自动上传工具 - OpenClaw 源码上传        ║
╚════════════════════════════════════════════════════════╝${C.reset}\n`);
}

async function checkDownloads() {
  console.log(`${C.blue}📁 检查已下载的资源...${C.reset}\n`);
  
  const files = [
    '1-openclaw-main.zip',
    '2-openclaw-dashboard.zip',
    '3-openclaw-dashboard-alt.zip',
    '4-frontend.tar.gz',
    '5-backend-docs.tar.gz',
    '6-docker-deploy.tar.gz',
    '7-full-package.tar.gz'
  ];

  const existingFiles = [];
  for (const file of files) {
    const filePath = path.join(DOWNLOADS_DIR, file);
    if (await fs.pathExists(filePath)) {
      const stats = await fs.stat(filePath);
      existingFiles.push({ name: file, size: formatSize(stats.size), path: filePath });
      console.log(`${C.green}  ✓ ${file} (${formatSize(stats.size)})${C.reset}`);
    }
  }

  if (existingFiles.length === 0) {
    console.log(`${C.red}  ✗ 未找到已下载的资源文件${C.reset}`);
    return null;
  }

  console.log(`${C.green}\n  共找到 ${existingFiles.length} 个资源文件${C.reset}\n`);
  return existingFiles;
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function getGitHubToken() {
  console.log(`${C.blue}\n🔐 GitHub 认证设置${C.reset}\n`);
  console.log(`${C.yellow}请按以下步骤获取 GitHub Personal Access Token：${C.reset}`);
  console.log('  1. 访问 https://github.com/settings/tokens');
  console.log('  2. 点击 "Generate new token (classic)"');
  console.log('  3. 选择权限（至少需要 repo 权限）');
  console.log('  4. 生成并复制 Token\n');

  const { token } = await inquirer.prompt([{
    type: 'password',
    name: 'token',
    message: '请输入你的 GitHub Personal Access Token:',
    mask: '*',
    validate: (input) => input.length > 0 || 'Token 不能为空'
  }]);

  return token;
}

async function verifyToken(token) {
  try {
    const octokit = new Octokit({ auth: token });
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`${C.green}\n  ✓ 认证成功！欢迎 ${user.login}${C.reset}`);
    return { octokit, user };
  } catch (error) {
    console.log(`${C.red}\n  ✗ Token 验证失败: ${error.message}${C.reset}`);
    return null;
  }
}

async function selectRepository(octokit, user) {
  console.log(`${C.blue}\n📦 仓库设置${C.reset}\n`);

  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: '请选择操作:',
    choices: [
      { name: '创建新仓库', value: 'create' },
      { name: '使用现有仓库', value: 'existing' }
    ]
  }]);

  if (action === 'create') {
    const { repoName, isPrivate } = await inquirer.prompt([
      {
        type: 'input',
        name: 'repoName',
        message: '请输入新仓库名称:',
        default: 'openclaw-resources',
        validate: (input) => input.length > 0 || '仓库名称不能为空'
      },
      {
        type: 'confirm',
        name: 'isPrivate',
        message: '是否设为私有仓库?',
        default: true
      }
    ]);

    try {
      const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
        name: repoName,
        description: 'OpenClaw 源码资源集合',
        private: isPrivate,
        auto_init: true
      });
      console.log(`${C.green}\n  ✓ 仓库创建成功: ${repo.html_url}${C.reset}\n`);
      return repo;
    } catch (error) {
      console.log(`${C.red}\n  ✗ 仓库创建失败: ${error.message}${C.reset}\n`);
      return null;
    }
  } else {
    try {
      const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({ per_page: 100 });

      if (repos.length === 0) {
        console.log(`${C.yellow}  没有现有仓库，将创建新仓库${C.reset}\n`);
        return selectRepository(octokit, user);
      }

      const { selectedRepo } = await inquirer.prompt([{
        type: 'list',
        name: 'selectedRepo',
        message: '选择要上传到的仓库:',
        choices: repos.map(r => ({ name: r.full_name, value: r }))
      }]);

      console.log(`${C.green}\n  ✓ 已选择仓库: ${selectedRepo.full_name}${C.reset}\n`);
      return selectedRepo;
    } catch (error) {
      console.log(`${C.red}\n  ✗ 获取仓库列表失败: ${error.message}${C.reset}\n`);
      return null;
    }
  }
}

async function prepareFiles(files) {
  console.log(`${C.blue}\n📂 准备上传文件...${C.reset}\n`);
  
  const tempDir = path.join(__dirname, 'temp_upload');
  await fs.ensureDir(tempDir);

  const readmePath = path.join(DOWNLOADS_DIR, '0-README.md');
  if (await fs.pathExists(readmePath)) {
    await fs.copy(readmePath, path.join(tempDir, 'README.md'));
    console.log(`${C.green}  ✓ 复制说明文档${C.reset}`);
  }

  const resourcesDir = path.join(tempDir, 'resources');
  await fs.ensureDir(resourcesDir);

  for (const file of files) {
    const destPath = path.join(resourcesDir, file.name);
    await fs.copy(file.path, destPath);
    console.log(`${C.green}  ✓ 复制 ${file.name}${C.reset}`);
  }

  console.log(`${C.green}\n  ✓ 文件准备完成${C.reset}\n`);
  return tempDir;
}

async function uploadToGitHub(repo, tempDir, user, token) {
  console.log(`${C.blue}\n☁️  开始上传到 GitHub...${C.reset}\n`);

  const repoUrl = `https://${token}@github.com/${repo.full_name}.git`;
  const git = simpleGit(tempDir);

  try {
    await git.init();
    await git.addRemote('origin', repoUrl);
    await git.addConfig('user.email', user.email || 'user@example.com');
    await git.addConfig('user.name', user.login);
    await git.add('.');
    console.log(`${C.green}  ✓ 添加文件到暂存区${C.reset}`);
    
    await git.commit('📦 Upload OpenClaw resources');
    console.log(`${C.green}  ✓ 创建提交${C.reset}`);
    
    const defaultBranch = repo.default_branch || 'main';
    await git.push('origin', `HEAD:${defaultBranch}`, ['--force']);
    console.log(`${C.green}  ✓ 推送到 ${defaultBranch} 分支${C.reset}`);

    console.log(`${C.green}\n  ✓ 上传成功！${C.reset}\n`);
    console.log(`${C.cyan}╔════════════════════════════════════════════════════════╗
║  🎉 资源已上传到你的 GitHub 仓库！                      ║
║                                                        ║
║  📎 仓库地址: ${repo.html_url.padEnd(36)} ║
║  🌐 访问链接: ${`https://github.com/${repo.full_name}`.padEnd(36)} ║
╚════════════════════════════════════════════════════════╝${C.reset}\n`);

    return true;
  } catch (error) {
    console.log(`${C.red}\n  ✗ 上传失败: ${error.message}${C.reset}\n`);
    return false;
  }
}

async function cleanup(tempDir) {
  try { await fs.remove(tempDir); } catch (e) {}
}

async function main() {
  printWelcome();

  try {
    const files = await checkDownloads();
    if (!files) {
      console.log(`${C.yellow}提示: 请先确保 OpenClaw 资源已下载${C.reset}\n`);
      return;
    }

    const token = await getGitHubToken();
    const auth = await verifyToken(token);
    if (!auth) return;

    const repo = await selectRepository(auth.octokit, auth.user);
    if (!repo) return;

    const tempDir = await prepareFiles(files);
    const success = await uploadToGitHub(repo, tempDir, auth.user, token);
    await cleanup(tempDir);

    if (success) {
      console.log(`${C.green}✨ 完成！请访问你的 GitHub 仓库下载资源。${C.reset}\n`);
    }
  } catch (error) {
    console.log(`${C.red}\n❌ 错误: ${error.message}${C.reset}\n`);
    process.exit(1);
  }
}

main();
