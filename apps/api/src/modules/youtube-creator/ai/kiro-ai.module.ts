import { Module } from '@nestjs/common';
import { KiroAIService } from './kiro-ai.service';
import { KiroAIController } from './kiro-ai.controller';
import { PrismaModule } from '../../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KiroAIController],
  providers: [KiroAIService],
  exports: [KiroAIService],
})
export class KiroAIModule {}
