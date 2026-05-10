import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { KiroAIService } from '../ai/kiro-ai.service';

@Injectable()
export class MarketingService {
  constructor(
    private prisma: PrismaService,
    private kiroAI: KiroAIService,
  ) {}

  async create(userId: string, videoId: string, data: any) {
    return this.prisma.marketingCampaign.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        videoId,
        name: data.name,
        platform: data.platform,
        campaignType: data.campaignType,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        status: data.status || 'draft',
        caption: data.caption,
        hashtags: data.hashtags,
        mediaUrl: data.mediaUrl,
        adBudget: data.adBudget || 0,
        notes: data.notes,
      },
    });
  }

  async findByVideo(videoId: string) {
    return this.prisma.marketingCampaign.findMany({
      where: { videoId },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async findByUser(userId: string, filters?: any) {
    const where: any = { userId };
    if (filters?.platform) where.platform = filters.platform;
    if (filters?.status) where.status = filters.status;

    return this.prisma.marketingCampaign.findMany({
      where,
      include: { video: { select: { title: true, status: true } } },
      orderBy: { scheduledDate: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.marketingCampaign.findUnique({
      where: { id },
      include: { video: true },
    });
  }

  async update(id: string, data: any) {
    const updateData = { ...data, updatedAt: new Date() };
    if (data.scheduledDate) updateData.scheduledDate = new Date(data.scheduledDate);
    if (data.publishedDate) updateData.publishedDate = new Date(data.publishedDate);
    return this.prisma.marketingCampaign.update({ where: { id }, data: updateData });
  }

  async delete(id: string) {
    return this.prisma.marketingCampaign.delete({ where: { id } });
  }

  async generateAICopy(userId: string, campaignId: string) {
    const campaign = await this.prisma.marketingCampaign.findUnique({
      where: { id: campaignId },
      include: { video: true },
    });
    if (!campaign) throw new Error('Campaign not found');

    const aiResponse = await this.kiroAI.generateMarketingCopy(
      userId,
      campaign.videoId,
      campaign.video,
      campaign.platform,
    );

    if (aiResponse.success) {
      await this.prisma.marketingCampaign.update({
        where: { id: campaignId },
        data: {
          aiGeneratedCopy: aiResponse.data,
          aiSuggestions: JSON.stringify({ generatedAt: new Date(), tokensUsed: aiResponse.tokensUsed }),
          updatedAt: new Date(),
        },
      });
    }

    return aiResponse;
  }

  async publishCampaign(id: string, postUrl?: string) {
    return this.prisma.marketingCampaign.update({
      where: { id },
      data: {
        status: 'published',
        publishedDate: new Date(),
        postUrl,
        updatedAt: new Date(),
      },
    });
  }

  async updateMetrics(id: string, metrics: { impressions?: number; engagement?: number; clicks?: number }) {
    return this.prisma.marketingCampaign.update({
      where: { id },
      data: { ...metrics, updatedAt: new Date() },
    });
  }

  async getUpcomingCampaigns(userId: string, days: number = 7) {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return this.prisma.marketingCampaign.findMany({
      where: {
        userId,
        status: 'scheduled',
        scheduledDate: { gte: now, lte: future },
      },
      include: { video: { select: { title: true } } },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async getMarketingStats(userId: string) {
    const campaigns = await this.prisma.marketingCampaign.findMany({ where: { userId } });

    return {
      total: campaigns.length,
      byPlatform: campaigns.reduce((acc, c) => {
        acc[c.platform] = (acc[c.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byStatus: campaigns.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalAdBudget: campaigns.reduce((sum, c) => sum + c.adBudget, 0),
      totalAdSpent: campaigns.reduce((sum, c) => sum + c.adSpent, 0),
      totalImpressions: campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0),
      totalEngagement: campaigns.reduce((sum, c) => sum + (c.engagement || 0), 0),
    };
  }
}
