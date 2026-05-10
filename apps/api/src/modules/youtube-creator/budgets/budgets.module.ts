import { Module } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { KiroAIModule } from '../ai/kiro-ai.module';

@Module({
  imports: [PrismaModule, KiroAIModule],
  controllers: [BudgetsController],
  providers: [BudgetsService],
  exports: [BudgetsService],
})
export class BudgetsModule {}
