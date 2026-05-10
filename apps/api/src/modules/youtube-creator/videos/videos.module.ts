import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { KiroAIModule } from '../ai/kiro-ai.module';

@Module({
  imports: [PrismaModule, KiroAIModule],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}
