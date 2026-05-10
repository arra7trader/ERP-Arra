import { Module } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { KiroAIModule } from '../ai/kiro-ai.module';

@Module({
  imports: [PrismaModule, KiroAIModule],
  controllers: [MarketingController],
  providers: [MarketingService],
  exports: [MarketingService],
})
export class MarketingModule {}
