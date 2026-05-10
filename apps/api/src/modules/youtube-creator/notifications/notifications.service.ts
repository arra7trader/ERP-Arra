import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        category: data.category,
        entityType: data.entityType,
        entityId: data.entityId,
        link: data.link,
        isAIGenerated: data.isAIGenerated || false,
      },
    });
  }

  async findByUser(userId: string, unreadOnly: boolean = false) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: string) {
    return this.prisma.notification.delete({ where: { id } });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async createAINotification(userId: string, title: string, message: string, category: string, entityType?: string, entityId?: string) {
    return this.create(userId, {
      title,
      message,
      type: 'ai_insight',
      category,
      entityType,
      entityId,
      isAIGenerated: true,
    });
  }
}
