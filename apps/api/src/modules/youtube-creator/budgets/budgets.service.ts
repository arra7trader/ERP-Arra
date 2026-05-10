import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { KiroAIService } from '../ai/kiro-ai.service';

@Injectable()
export class BudgetsService {
  constructor(
    private prisma: PrismaService,
    private kiroAI: KiroAIService,
  ) {}

  async create(userId: string, videoId: string, data: any) {
    return this.prisma.budget.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        videoId,
        category: data.category,
        description: data.description,
        plannedAmount: data.plannedAmount,
        actualAmount: data.actualAmount || 0,
        status: data.status || 'planned',
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
        paymentMethod: data.paymentMethod,
        receipt: data.receipt,
        notes: data.notes,
      },
    });
  }

  async createBulk(userId: string, videoId: string, items: any[]) {
    const budgets = items.map(item => ({
      id: crypto.randomUUID(),
      userId,
      videoId,
      category: item.category,
      description: item.description,
      plannedAmount: item.plannedAmount || item.estimatedAmount,
      actualAmount: item.actualAmount || 0,
      status: 'planned',
    }));

    return this.prisma.budget.createMany({ data: budgets });
  }

  async findByVideo(videoId: string) {
    return this.prisma.budget.findMany({
      where: { videoId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.budget.findMany({
      where: { userId },
      include: { video: { select: { title: true, status: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: any) {
    const budget = await this.prisma.budget.findUnique({ where: { id } });
    if (!budget) throw new Error('Budget not found');

    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.paymentDate) updateData.paymentDate = new Date(data.paymentDate);

    // Check for over-budget risk
    const newActual = data.actualAmount ?? budget.actualAmount;
    if (newActual > budget.plannedAmount) {
      updateData.status = 'over_budget';
      updateData.aiRiskFlag = true;
    } else if (newActual >= budget.plannedAmount * 0.9) {
      updateData.aiRiskFlag = true;
    }

    return this.prisma.budget.update({
      where: { id },
      data: updateData,
    });
  }

  async recordExpense(id: string, amount: number, paymentMethod?: string, notes?: string) {
    const budget = await this.prisma.budget.findUnique({ where: { id } });
    if (!budget) throw new Error('Budget not found');

    const newActual = budget.actualAmount + amount;
    let status = budget.status;
    let aiRiskFlag = budget.aiRiskFlag;

    if (newActual > budget.plannedAmount) {
      status = 'over_budget';
      aiRiskFlag = true;
    } else if (newActual >= budget.plannedAmount * 0.9) {
      aiRiskFlag = true;
    } else if (newActual > 0) {
      status = 'spent';
    }

    return this.prisma.budget.update({
      where: { id },
      data: {
        actualAmount: newActual,
        status,
        aiRiskFlag,
        paymentMethod: paymentMethod || budget.paymentMethod,
        paymentDate: new Date(),
        notes: notes ? `${budget.notes || ''}\n${notes}` : budget.notes,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string) {
    return this.prisma.budget.delete({ where: { id } });
  }

  async getVideoRABSummary(videoId: string) {
    const budgets = await this.findByVideo(videoId);
    
    const summary = {
      totalPlanned: 0,
      totalActual: 0,
      remaining: 0,
      percentUsed: 0,
      byCategory: {} as Record<string, { planned: number; actual: number }>,
      atRisk: [] as any[],
      overBudget: [] as any[],
    };

    budgets.forEach(b => {
      summary.totalPlanned += b.plannedAmount;
      summary.totalActual += b.actualAmount;
      
      if (!summary.byCategory[b.category]) {
        summary.byCategory[b.category] = { planned: 0, actual: 0 };
      }
      summary.byCategory[b.category].planned += b.plannedAmount;
      summary.byCategory[b.category].actual += b.actualAmount;

      if (b.status === 'over_budget') summary.overBudget.push(b);
      else if (b.aiRiskFlag) summary.atRisk.push(b);
    });

    summary.remaining = summary.totalPlanned - summary.totalActual;
    summary.percentUsed = summary.totalPlanned > 0 
      ? Math.round((summary.totalActual / summary.totalPlanned) * 100) 
      : 0;

    return summary;
  }

  async getUserBudgetStats(userId: string) {
    const budgets = await this.prisma.budget.findMany({ where: { userId } });
    
    return {
      totalProjects: new Set(budgets.map(b => b.videoId)).size,
      totalPlanned: budgets.reduce((sum, b) => sum + b.plannedAmount, 0),
      totalActual: budgets.reduce((sum, b) => sum + b.actualAmount, 0),
      atRiskCount: budgets.filter(b => b.aiRiskFlag).length,
      overBudgetCount: budgets.filter(b => b.status === 'over_budget').length,
    };
  }

  async analyzeWithAI(userId: string, videoId: string) {
    const budgets = await this.findByVideo(videoId);
    return this.kiroAI.analyzeBudget(userId, videoId, budgets);
  }
}
