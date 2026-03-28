import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import simpleGit from 'simple-git';
import * as fs from 'fs-extra';
import * as path from 'path';

const DOWNLOADS_DIR = '/home/gem/workspace/agent/downloads';

interface UploadResult {
  success: boolean;
  repoUrl?: string;
  message: string;
}

@Injectable()
export class GithubUploadService {
  
  async uploadToGithub(token: string, repoName: string, isPrivate: boolean = true): Promise<UploadResult> {
    try {
      // 验证 Token
      const octokit = new Octokit({ auth: token });
      const { data: user } = await octokit.rest.users.getAuthenticated();
      
      // 检查资源文件
      const files = await this.checkDownloads();
      if (files.length === 0) {
        return { success: false, message: '未找到资源文件' };
      }

      // 创建或获取仓库
      let repo;
      try {
        const { data: existingRepo } = await octokit.rest.repos.get({
          owner: user.login,
          repo: repoName,
        });
        repo = existingRepo;
      } catch {
        // 仓库不存在，创建新仓库
        const { data: newRepo } = await octokit.rest.repos.createForAuthenticatedUser({
          name: repoName,
          description: 'OpenClaw 源码资源集合',
          private: isPrivate,
          auto_init: true,
        });
        repo = newRepo;
      }

      // 准备文件
      const tempDir = await this.prepareFiles(files);

      // 推送到 GitHub
      const repoUrl = `https://${token}@github.com/${repo.full_name}.git`;
      const git = simpleGit(tempDir);
      
      await git.init();
      await git.addRemote('origin', repoUrl);
      await git.addConfig('user.email', user.email || 'user@example.com');
      await git.addConfig('user.name', user.login);
      await git.add('.');
      await git.commit('📦 Upload OpenClaw resources');
      
      const defaultBranch = repo.default_branch || 'main';
      await git.push('origin', `HEAD:${defaultBranch}`, ['--force']);

      // 清理
      await fs.remove(tempDir);

      return {
        success: true,
        repoUrl: repo.html_url,
        message: `上传成功！共 ${files.length} 个文件`,
      };
    } catch (error) {
      return {
        success: false,
        message: `上传失败: ${error.message}`,
      };
    }
  }

  private async checkDownloads(): Promise<Array<{name: string, size: string, path: string}>> {
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
        existingFiles.push({
          name: file,
          size: this.formatSize(stats.size),
          path: filePath,
        });
      }
    }

    return existingFiles;
  }

  private async prepareFiles(files: Array<{name: string, path: string}>) {
    const tempDir = path.join('/tmp', 'github-upload-' + Date.now());
    await fs.ensureDir(tempDir);

    const readmePath = path.join(DOWNLOADS_DIR, '0-README.md');
    if (await fs.pathExists(readmePath)) {
      await fs.copy(readmePath, path.join(tempDir, 'README.md'));
    }

    const resourcesDir = path.join(tempDir, 'resources');
    await fs.ensureDir(resourcesDir);

    for (const file of files) {
      await fs.copy(file.path, path.join(resourcesDir, file.name));
    }

    return tempDir;
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
