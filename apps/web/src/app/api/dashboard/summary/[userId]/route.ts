import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    const [videos, budgets, talents, campaigns] = await Promise.all([
      db.execute({ sql: 'SELECT * FROM Video WHERE userId = ?', args: [userId] }),
      db.execute({ sql: 'SELECT * FROM Budget WHERE userId = ?', args: [userId] }),
      db.execute({ sql: 'SELECT * FROM Talent WHERE userId = ?', args: [userId] }),
      db.execute({ sql: 'SELECT * FROM MarketingCampaign WHERE userId = ?', args: [userId] }),
    ]);

    const totalBudget = budgets.rows.reduce((sum: number, b: any) => sum + (b.plannedAmount || 0), 0);
    const totalSpent = budgets.rows.reduce((sum: number, b: any) => sum + (b.actualAmount || 0), 0);

    return NextResponse.json({
      totalVideos: videos.rows.length,
      totalTalents: talents.rows.length,
      totalCampaigns: campaigns.rows.length,
      totalBudget,
      totalSpent,
      videosInProgress: videos.rows.filter((v: any) => v.status === 'production').length,
      videosCompleted: videos.rows.filter((v: any) => v.status === 'published').length,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}