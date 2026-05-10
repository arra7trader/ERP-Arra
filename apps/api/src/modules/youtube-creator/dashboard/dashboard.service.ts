import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { KiroAIService } from '../ai/kiro-ai.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private kiroAI: KiroAIService,
  ) {}

  async getDashboardSummary(userId: string) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [videos, budgets, talents, campaigns, recentVideos] = await Promise.all([
      this.prisma.video.findMany({ where: { userId } }),
      this.prisma.budget.findMany({ where: { userId } }),
      this.prisma.talent.findMany({ where: { userId, isActive: true } }),
      this.prisma.marketingCampaign.findMany({ where: { userId } }),
      this.prisma.video.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { budgets: true },
      }),
    ]);

    const videoStats = {
      total: videos.length,
      byStatus: videos.reduce((acc, v) => {
        acc[v.status] = (acc[v.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      inProduction: videos.filter(v => ['pre_production', 'production', 'post_production'].includes(v.status)).length,
      published: videos.filter(v => v.status === 'published').length,
    };

    const budgetStats = {
      totalPlanned: budgets.reduce((sum, b) => sum + b.plannedAmount, 0),
      totalActual: budgets.reduce((sum, b) => sum + b.actualAmount, 0),
      atRisk: budgets.filter(b => b.aiRiskFlag).length,
      overBudget: budgets.filter(b => b.status === 'over_budget').length,
    };

    const upcomingDeadlines = videos
      .filter(v => v.plannedEndDate && new Date(v.plannedEndDate) >= now && new Date(v.plannedEndDate) <= nextWeek)
      .sort((a, b) => new Date(a.plannedEndDate!).getTime() - new Date(b.plannedEndDate!).getTime())
      .slice(0, 5);

    const upcomingCampaigns = campaigns
      .filter(c => c.scheduledDate && new Date(c.scheduledDate) >= now && new Date(c.scheduledDate) <= nextWeek)
      .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())
      .slice(0, 5);

    return {
      videoStats,
      budgetStats,
      talentCount: talents.length,
      campaignStats: {
        total: campaigns.length,
        scheduled: campaigns.filter(c => c.status === 'scheduled').length,
        published: campaigns.filter(c => c.status === 'published').length,
      },
      upcomingDeadlines,
      upcomingCampaigns,
      recentVideos,
      financialHealth: budgetStats.totalPlanned > 0
        ? Math.round(((budgetStats.totalPlanned - budgetStats.totalActual) / budgetStats.totalPlanned) * 100)
        : 100,
    };
  }

  async getAIBriefing(userId: string) {
    return this.kiroAI.getDailyBriefing(userId);
  }

  async getProductionCalendar(userId: string, month?: number, year?: number) {
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth();
    
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    const [videos, campaigns] = await Promise.all([
      this.prisma.video.findMany({
        where: {
          userId,
          OR: [
            { plannedStartDate: { gte: startDate, lte: endDate } },
            { plannedEndDate: { gte: startDate, lte: endDate } },
            { publishDate: { gte: startDate, lte: endDate } },
          ],
        },
      }),
      this.prisma.marketingCampaign.findMany({
        where: {
          userId,
          scheduledDate: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    const events: any[] = [];

    videos.forEach(v => {
      if (v.plannedStartDate) events.push({ type: 'video_start', date: v.plannedStartDate, title: v.title, videoId: v.id });
      if (v.plannedEndDate) events.push({ type: 'video_deadline', date: v.plannedEndDate, title: v.title, videoId: v.id });
      if (v.publishDate) events.push({ type: 'video_publish', date: v.publishDate, title: v.title, videoId: v.id });
    });

    campaigns.forEach(c => {
      if (c.scheduledDate) events.push({ type: 'campaign', date: c.scheduledDate, title: c.name, platform: c.platform, campaignId: c.id });
    });

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getFinancialOverview(userId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      include: { video: { select: { title: true, status: true } } },
    });

    const byVideo = budgets.reduce((acc, b) => {
      if (!acc[b.videoId]) {
        acc[b.videoId] = { title: b.video.title, status: b.video.status, planned: 0, actual: 0, items: [] };
      }
      acc[b.videoId].planned += b.plannedAmount;
      acc[b.videoId].actual += b.actualAmount;
      acc[b.videoId].items.push(b);
      return acc;
    }, {} as Record<string, any>);

    const byCategory = budgets.reduce((acc, b) => {
      if (!acc[b.category]) acc[b.category] = { planned: 0, actual: 0 };
      acc[b.category].planned += b.plannedAmount;
      acc[b.category].actual += b.actualAmount;
      return acc;
    }, {} as Record<string, any>);

    return {
      totalPlanned: budgets.reduce((sum, b) => sum + b.plannedAmount, 0),
      totalActual: budgets.reduce((sum, b) => sum + b.actualAmount, 0),
      byVideo: Object.values(byVideo),
      byCategory,
      alerts: budgets.filter(b => b.aiRiskFlag || b.status === 'over_budget'),
    };
  }
}
