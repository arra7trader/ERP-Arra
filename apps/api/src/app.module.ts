import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';

// YouTube Creator ERP Modules
import { KiroAIModule } from './modules/youtube-creator/ai/kiro-ai.module';
import { VideosModule } from './modules/youtube-creator/videos/videos.module';
import { BudgetsModule } from './modules/youtube-creator/budgets/budgets.module';
import { TalentsModule } from './modules/youtube-creator/talents/talents.module';
import { MarketingModule } from './modules/youtube-creator/marketing/marketing.module';
import { DashboardModule } from './modules/youtube-creator/dashboard/dashboard.module';
import { NotificationsModule } from './modules/youtube-creator/notifications/notifications.module';
import { AuthModule } from './modules/youtube-creator/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    
    // YouTube Creator ERP
    AuthModule,
    KiroAIModule,
    VideosModule,
    BudgetsModule,
    TalentsModule,
    MarketingModule,
    DashboardModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
