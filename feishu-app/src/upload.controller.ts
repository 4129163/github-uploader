import { Controller, Post, Body, Headers } from '@nestjs/common';
import { FeishuService } from './feishu.service';
import { GithubUploadService } from './github-upload.service';

@Controller('webhook')
export class UploadController {
  constructor(
    private readonly feishuService: FeishuService,
    private readonly githubUploadService: GithubUploadService,
  ) {}

  @Post('feishu')
  async handleFeishuWebhook(@Body() body: any, @Headers() headers: any) {
    console.log('收到飞书回调:', body);

    // 处理卡片回调
    if (body.action && body.action.value) {
      const action = body.action.value.action;
      const openId = body.open_id;
      const messageId = body.open_message_id;

      switch (action) {
        case 'start_upload':
          return this.handleStartUpload(openId, messageId);
        
        case 'show_help':
          return this.handleShowHelp(openId);
        
        case 'confirm_upload':
          const { token, repoName, isPrivate } = body.action.value;
          return this.handleConfirmUpload(openId, messageId, token, repoName, isPrivate);
        
        default:
          return { code: 0 };
      }
    }

    return { code: 0 };
  }

  private async handleStartUpload(openId: string, messageId: string) {
    // 发送配置输入卡片
    const configCard = {
      schema: '2.0',
      header: {
        title: { tag: 'plain_text', content: '🔐 配置上传参数' },
        template: 'yellow',
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: '**请提供以下信息：**\n\n1. GitHub Personal Access Token\n2. 仓库名称（可选，默认: openclaw-resources）\n3. 是否私有仓库'
          }
        },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: '**获取 Token 步骤：**\n1. 访问 https://github.com/settings/tokens\n2. 点击 "Generate new token (classic)"\n3. 勾选 **repo** 权限\n4. 生成并复制 Token'
          }
        },
        {
          tag': 'input',
          name: 'github_token',
          placeholder: {
            tag: 'plain_text',
            content: '请输入 GitHub Token'
          }
        },
        {
          tag: 'input',
          name: 'repo_name',
          placeholder: {
            tag: 'plain_text',
            content: '仓库名称（默认: openclaw-resources）'
          }
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: { tag: 'plain_text', content: '确认上传' },
              type: 'primary',
              value: { action: 'submit_config' }
            }
          ]
        }
      ]
    };

    await this.feishuService.updateCardMessage(messageId, configCard);
    return { code: 0 };
  }

  private async handleShowHelp(openId: string) {
    const helpText = `📖 **GitHub 上传工具使用说明**

**功能：**
自动将 OpenClaw 源码上传到你的 GitHub 仓库

**包含资源：**
• openclaw-main.zip - 主仓库源码（40MB）
• dashboard.zip - 管理界面（1.3MB）
• frontend.tar.gz - 前端代码（489KB）
• backend-docs.tar.gz - 后端文档（10MB）
• docker-deploy.tar.gz - Docker配置（7KB）
• full-package.tar.gz - 完整包（35MB）

**操作步骤：**
1. 点击 "🚀 开始上传" 按钮
2. 输入 GitHub Personal Access Token
3. 确认仓库名称（可选）
4. 等待上传完成

**获取 Token：**
访问 https://github.com/settings/tokens
生成 Classic Token，勾选 **repo** 权限

如有问题请联系管理员。`;

    await this.feishuService.sendTextMessage(openId, helpText);
    return { code: 0 };
  }

  private async handleConfirmUpload(
    openId: string,
    messageId: string,
    token: string,
    repoName: string,
    isPrivate: boolean
  ) {
    // 更新卡片为上传中状态
    const uploadingCard = {
      schema: '2.0',
      header: {
        title: { tag: 'plain_text', content: '⏳ 正在上传...' },
        template: 'orange',
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: '正在上传资源到 GitHub，请稍候...\n\n⏳ 验证 Token...\n⏳ 创建仓库...\n⏳ 推送文件...'
          }
        }
      ]
    };
    await this.feishuService.updateCardMessage(messageId, uploadingCard);

    // 执行上传
    const result = await this.githubUploadService.uploadToGithub(
      token,
      repoName || 'openclaw-resources',
      isPrivate
    );

    // 更新结果
    const resultCard = {
      schema: '2.0',
      header: {
        title: { 
          tag: 'plain_text', 
          content: result.success ? '✅ 上传成功！' : '❌ 上传失败' 
        },
        template: result.success ? 'green' : 'red',
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: result.success 
              ? `**${result.message}**\n\n📎 **仓库地址：**\n${result.repoUrl}`
              : `**错误信息：**\n${result.message}`
          }
        },
        {
          tag: 'action',
          actions: result.success ? [
            {
              tag: 'button',
              text: { tag: 'plain_text', content: '🔗 打开仓库' },
              type: 'primary',
              multi_url: {
                pc: result.repoUrl,
              }
            }
          ] : [
            {
              tag: 'button',
              text: { tag: 'plain_text', content: '🔄 重新上传' },
              type: 'primary',
              value: { action: 'start_upload' }
            }
          ]
        }
      ]
    };

    await this.feishuService.updateCardMessage(messageId, resultCard);
    return { code: 0 };
  }
}
