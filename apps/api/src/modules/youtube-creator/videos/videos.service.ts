import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { KiroAIService } from '../ai/kiro-ai.service';

@Injectable()
export class VideosService {
  constructor(
    private prisma: PrismaService,
    private kiroAI: KiroAIService,
  ) {}

  async create(userId: string, data: any) {
    const video = await this.prisma.video.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        title: data.title,
        description: data.description,
        concept: data.concept,
        script: data.script,
        status: data.status || 'ideation',
        priority: data.priority || 'medium',
        plannedStartDate: data.plannedStartDate ? new Date(data.plannedStartDate) : null,
        plannedEndDate: data.plannedEndDate ? new Date(data.plannedEndDate) : null,
        duration: data.duration,
        category: data.category,
        tags: data.tags,
      },
    });

    // Get AI schedule suggestion if requested
    if (data.requestAISuggestion) {
      const suggestion = await this.kiroAI.suggestSchedule(userId, video.id, data);
      if (suggestion.success) {
        await this.prisma.video.update({
          where: { id: video.id },
          data: { aiRecommendations: suggestion.data },
        });
      }
    }

    return video;
  }

  async findAll(userId: string, filters?: any) {
    const where: any = { userId };
    
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.category) where.category = filters.category;

    return this.prisma.video.findMany({
      where,
      include: {
        budgets: true,
        videoTalents: {
          include: { talent: true },
        },
        campaigns: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.video.findUnique({
      where: { id },
      include: {
        budgets: true,
        videoTalents: {
          include: { talent: true },
        },
        campaigns: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.video.update({
      where: { id },
      data: {
        ...data,
        plannedStartDate: data.plannedStartDate ? new Date(data.plannedStartDate) : undefined,
        plannedEndDate: data.plannedEndDate ? new Date(data.plannedEndDate) : undefined,
        actualStartDate: data.actualStartDate ? new Date(data.actualStartDate) : undefined,
        actualEndDate: data.actualEndDate ? new Date(data.actualEndDate) : undefined,
        publishDate: data.publishDate ? new Date(data.publishDate) : undefined,
        updatedAt: new Date(),
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const updateData: any = { status, updatedAt: new Date() };
    
    if (status === 'production' && !updateData.actualStartDate) {
      updateData.actualStartDate = new Date();
    }
    if (status === 'published') {
      updateData.actualEndDate = new Date();
      updateData.publishDate = new Date();
    }

    return this.prisma.video.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return this.prisma.video.delete({ where: { id } });
  }

  async getVideoStats(userId: string) {
    const [total, byStatus, byPriority] = await Promise.all([
      this.prisma.video.count({ where: { userId } }),
      this.prisma.video.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
      this.prisma.video.groupBy({
        by: ['priority'],
        where: { userId },
        _count: true,
      }),
    ]);

    return { total, byStatus, byPriority };
  }

  async getUpcomingDeadlines(userId: string, days: number = 7) {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return this.prisma.video.findMany({
      where: {
        userId,
        plannedEndDate: {
          gte: now,
          lte: future,
        },
        status: { notIn: ['published'] },
      },
      orderBy: { plannedEndDate: 'asc' },
    });
  }
}
