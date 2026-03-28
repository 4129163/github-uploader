import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用 CORS
  app.enableCors();
  
  // 设置全局前缀
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 飞书 GitHub 上传应用已启动`);
  console.log(`📡 Webhook 地址: http://localhost:${port}/api/webhook/feishu`);
}

bootstrap();
