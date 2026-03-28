import { Module } from '@nestjs/common';
import { FeishuService } from './feishu.service';
import { GithubUploadService } from './github-upload.service';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
  providers: [FeishuService, GithubUploadService],
})
export class AppModule {}
