import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { KiroAIModule } from '../ai/kiro-ai.module';

@Module({
  imports: [PrismaModule, KiroAIModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
