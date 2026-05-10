import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    const [videos, budgets, talents, campaigns] = await Promise.all([
      db.execute({ sql: 'SELECT * FROM Video WHERE userId = ? ORDER BY createdAt DESC', args: [userId] }),
      db.execute({ sql: 'SELECT * FROM Budget WHERE userId = ?', args: [userId] }),
      db.execute({ sql: 'SELECT * FROM Talent WHERE userId = ?', args: [userId] }),
      db.execute({ sql: 'SELECT * FROM MarketingCampaign WHERE userId = ?', args: [userId] }),
    ]);

    const totalPlanned = budgets.rows.reduce((sum: number, b: any) => sum + (Number(b.plannedAmount) || 0), 0);
    const totalActual = budgets.rows.reduce((sum: number, b: any) => sum + (Number(b.actualAmount) || 0), 0);
    const atRiskBudgets = budgets.rows.filter((b: any) => Number(b.actualAmount) > Number(b.plannedAmount)).length;

    const videoList = videos.rows as any[];
    const inProduction = videoList.filter(v => v.status === 'production').length;
    const published = videoList.filter(v => v.status === 'published').length;

    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = videoList.filter(v => {
      if (!v.plannedEndDate) return false;
      const endDate = new Date(v.plannedEndDate);
      return endDate >= now && endDate <= sevenDaysLater;
    });

    const financialHealth = totalPlanned > 0 ? Math.round(((totalPlanned - totalActual) / totalPlanned) * 100) : 100;

    return NextResponse.json({
      videoStats: {
        total: videoList.length,
        inProduction,
        published,
      },
      budgetStats: {
        totalPlanned,
        totalActual,
        atRisk: atRiskBudgets,
      },
      talentStats: {
        total: talents.rows.length,
        active: talents.rows.filter((t: any) => t.isActive).length,
      },
      campaignStats: {
        total: campaigns.rows.length,
        active: campaigns.rows.filter((c: any) => c.status === 'active').length,
      },
      financialHealth: Math.max(0, Math.min(100, financialHealth)),
      upcomingDeadlines: upcomingDeadlines.slice(0, 5),
      recentVideos: videoList.slice(0, 5),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}