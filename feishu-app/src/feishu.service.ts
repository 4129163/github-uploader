import { Injectable } from '@nestjs/common';
import * as lark from '@larksuiteoapi/node-sdk';

// 飞书应用凭证 - 需要在飞书开发者后台获取
const FEISHU_APP_ID = 'cli_xxxxxxxxx';      // 替换为你的 App ID
const FEISHU_APP_SECRET = 'xxxxxxxxxx';     // 替换为你的 App Secret

@Injectable()
export class FeishuService {
  private readonly client: lark.Client;

  constructor() {
    this.client = new lark.Client({
      appId: FEISHU_APP_ID,
      appSecret: FEISHU_APP_SECRET,
      appType: lark.AppType.SelfBuild,
      domain: lark.Domain.Feishu,
    });
  }

  getClient(): lark.Client {
    return this.client;
  }

  // 发送卡片消息
  async sendCardMessage(receiveId: string, cardData: any) {
    try {
      const res = await this.client.im.message.create({
        params: { receive_id_type: 'open_id' },
        data: {
          receive_id: receiveId,
          content: JSON.stringify(cardData),
          msg_type: 'interactive',
        },
      });

      if (res.code !== 0) {
        throw new Error(`发送卡片失败: ${res.msg}`);
      }

      return res.data;
    } catch (error) {
      console.error('发送卡片消息失败:', error);
      throw error;
    }
  }

  // 更新卡片消息
  async updateCardMessage(messageId: string, cardData: any) {
    try {
      const res = await this.client.im.message.patch({
        path: { message_id: messageId },
        data: {
          content: JSON.stringify(cardData),
        },
      });

      if (res.code !== 0) {
        throw new Error(`更新卡片失败: ${res.msg}`);
      }

      return res.data;
    } catch (error) {
      console.error('更新卡片消息失败:', error);
      throw error;
    }
  }

  // 发送文本消息
  async sendTextMessage(receiveId: string, text: string) {
    try {
      const res = await this.client.im.message.create({
        params: { receive_id_type: 'open_id' },
        data: {
          receive_id: receiveId,
          content: JSON.stringify({ text }),
          msg_type: 'text',
        },
      });

      if (res.code !== 0) {
        throw new Error(`发送消息失败: ${res.msg}`);
      }

      return res.data;
    } catch (error) {
      console.error('发送文本消息失败:', error);
      throw error;
    }
  }
}
