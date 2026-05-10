import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class TalentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.talent.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        ageRange: data.ageRange,
        ethnicity: data.ethnicity,
        height: data.height,
        bodyType: data.bodyType,
        hairColor: data.hairColor,
        hairStyle: data.hairStyle,
        skinTone: data.skinTone,
        faceReference: data.faceReference,
        bodyReference: data.bodyReference,
        voiceSample: data.voiceSample,
        specialty: data.specialty,
        rate: data.rate,
        currency: data.currency || 'IDR',
        aiConsistencyScore: data.aiConsistencyScore,
        aiParameters: data.aiParameters ? JSON.stringify(data.aiParameters) : null,
        notes: data.notes,
      },
    });
  }

  async findAll(userId: string, filters?: any) {
    const where: any = { userId, isActive: true };
    if (filters?.specialty) where.specialty = filters.specialty;
    if (filters?.gender) where.gender = filters.gender;

    return this.prisma.talent.findMany({
      where,
      include: {
        videoTalents: {
          include: { video: { select: { title: true, status: true } } },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.talent.findUnique({
      where: { id },
      include: {
        videoTalents: {
          include: { video: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async update(id: string, data: any) {
    const updateData = { ...data, updatedAt: new Date() };
    if (data.aiParameters) updateData.aiParameters = JSON.stringify(data.aiParameters);
    return this.prisma.talent.update({ where: { id }, data: updateData });
  }

  async delete(id: string) {
    return this.prisma.talent.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() },
    });
  }

  async assignToVideo(videoId: string, talentId: string, data: any) {
    return this.prisma.videoTalent.create({
      data: {
        id: crypto.randomUUID(),
        videoId,
        talentId,
        role: data.role,
        characterName: data.characterName,
        agreedFee: data.agreedFee,
        shootingDates: data.shootingDates ? JSON.stringify(data.shootingDates) : null,
        notes: data.notes,
      },
    });
  }

  async updateVideoTalent(id: string, data: any) {
    return this.prisma.videoTalent.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async recordTalentPayment(id: string, amount: number) {
    const vt = await this.prisma.videoTalent.findUnique({ where: { id } });
    if (!vt) throw new Error('VideoTalent not found');

    const newPaid = vt.paidAmount + amount;
    let status = 'partial';
    if (vt.agreedFee && newPaid >= vt.agreedFee) status = 'paid';

    return this.prisma.videoTalent.update({
      where: { id },
      data: { paidAmount: newPaid, paymentStatus: status, updatedAt: new Date() },
    });
  }

  async removeFromVideo(videoId: string, talentId: string) {
    return this.prisma.videoTalent.delete({
      where: { videoId_talentId: { videoId, talentId } },
    });
  }

  async getTalentStats(userId: string) {
    const talents = await this.prisma.talent.findMany({ where: { userId, isActive: true } });
    const videoTalents = await this.prisma.videoTalent.findMany({
      where: { talent: { userId } },
    });

    return {
      totalTalents: talents.length,
      bySpecialty: talents.reduce((acc, t) => {
        const key = t.specialty || 'other';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalAssignments: videoTalents.length,
      pendingPayments: videoTalents.filter(vt => vt.paymentStatus !== 'paid').length,
    };
  }
}
