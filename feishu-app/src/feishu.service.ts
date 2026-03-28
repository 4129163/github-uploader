import { Injectable, Logger } from '@nestjs/common';
import * as lark from '@larksuiteoapi/node-sdk';

@Injectable()
export class FeishuService {
  private readonly logger = new Logger(FeishuService.name);
  
  // 从环境变量读取飞书配置
  private readonly APP_ID = process.env.FEISHU_APP_ID || '';
  private readonly APP_SECRET = process.env.FEISHU_APP_SECRET || '';
  private readonly ENCRYPT_KEY = process.env.FEISHU_ENCRYPT_KEY || '';
  private readonly VERIFICATION_TOKEN = process.env.FEISHU_VERIFICATION_TOKEN || '';
  
  private client: lark.Client;

  constructor() {
    // 验证配置
    if (!this.APP_ID || !this.APP_SECRET) {
      this.logger.error('缺少飞书应用配置! 请设置环境变量 FEISHU_APP_ID 和 FEISHU_APP_SECRET');
      this.logger.error('获取方式: https://open.feishu.cn/app -> 创建应用 -> 凭证与基础信息');
      throw new Error('Missing Feishu configuration');
    }

    // 初始化飞书客户端
    this.client = new lark.Client({
      appId: this.APP_ID,
      appSecret: this.APP_SECRET,
      appType: lark.AppType.SelfBuild,
    });

    this.logger.log('飞书服务初始化成功');
  }

  /**
   * 发送消息卡片到群聊
   */
  async sendCard(chatId: string, cardContent: any): Promise<void> {
    try {
      const response = await this.client.im.message.create({
        params: {
          receive_id_type: 'chat_id',
        },
        data: {
          receive_id: chatId,
          msg_type: 'interactive',
          content: JSON.stringify(cardContent),
        },
      });

      if (response.code !== 0) {
        this.logger.error(`发送卡片失败: ${response.msg}`);
        throw new Error(response.msg);
      }

      this.logger.log(`卡片发送成功: ${chatId}`);
    } catch (error) {
      this.logger.error(`发送卡片异常: ${error.message}`);
      throw error;
    }
  }

  /**
   * 发送文本消息
   */
  async sendTextMessage(chatId: string, text: string): Promise<void> {
    try {
      const response = await this.client.im.message.create({
        params: {
          receive_id_type: 'chat_id',
        },
        data: {
          receive_id: chatId,
          msg_type: 'text',
          content: JSON.stringify({ text }),
        },
      });

      if (response.code !== 0) {
        this.logger.error(`发送消息失败: ${response.msg}`);
        throw new Error(response.msg);
      }
    } catch (error) {
      this.logger.error(`发送消息异常: ${error.message}`);
      throw error;
    }
  }

  /**
   * 更新消息卡片
   */
  async updateCard(messageId: string, cardContent: any): Promise<void> {
    try {
      const response = await this.client.im.message.patch({
        data: {
          content: JSON.stringify(cardContent),
        },
      }, lark.Request.setTenantAccessToken(''),
      lark.Request.setPathParams({ message_id: messageId }));

      if (response.code !== 0) {
        this.logger.error(`更新卡片失败: ${response.msg}`);
        throw new Error(response.msg);
      }

      this.logger.log(`卡片更新成功: ${messageId}`);
    } catch (error) {
      this.logger.error(`更新卡片异常: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(userId: string): Promise<any> {
    try {
      const response = await this.client.contact.user.get({
        params: {
          user_id_type: 'open_id',
        },
      }, lark.Request.setTenantAccessToken(''),
      lark.Request.setPathParams({ user_id: userId }));

      if (response.code !== 0) {
        this.logger.error(`获取用户信息失败: ${response.msg}`);
        return null;
      }

      return response.data;
    } catch (error) {
      this.logger.error(`获取用户信息异常: ${error.message}`);
      return null;
    }
  }

  /**
   * 验证事件订阅 challenge
   */
  verifyChallenge(body: any): any {
    // 如果有配置 verification token，需要验证
    if (this.VERIFICATION_TOKEN && body.token !== this.VERIFICATION_TOKEN) {
      this.logger.warn('Verification token 不匹配');
      throw new Error('Invalid verification token');
    }

    // 返回 challenge 响应
    return {
      challenge: body.challenge,
    };
  }

  /**
   * 获取配置信息（调试用）
   */
  getConfigInfo(): { appId: string; hasSecret: boolean } {
    return {
      appId: this.APP_ID,
      hasSecret: !!this.APP_SECRET,
    };
  }
}
