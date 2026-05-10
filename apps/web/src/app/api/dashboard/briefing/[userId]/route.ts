import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    const [videos, budgets] = await Promise.all([
      db.execute({ sql: 'SELECT * FROM Video WHERE userId = ?', args: [userId] }),
      db.execute({ sql: 'SELECT * FROM Budget WHERE userId = ?', args: [userId] }),
    ]);

    const videoList = videos.rows as any[];
    const inProduction = videoList.filter(v => v.status === 'production').length;
    const inPostProduction = videoList.filter(v => v.status === 'post_production').length;
    
    const totalBudget = budgets.rows.reduce((sum: number, b: any) => sum + (Number(b.plannedAmount) || 0), 0);
    const totalSpent = budgets.rows.reduce((sum: number, b: any) => sum + (Number(b.actualAmount) || 0), 0);
    const budgetUsage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    const todayTasks: string[] = [];
    if (inProduction > 0) todayTasks.push(`${inProduction} video dalam produksi`);
    if (inPostProduction > 0) todayTasks.push(`${inPostProduction} video perlu editing`);
    if (budgetUsage > 80) todayTasks.push('Review pengeluaran budget');
    if (todayTasks.length === 0) todayTasks.push('Buat rencana video baru');

    let aiInsights = `Anda memiliki ${videoList.length} video project. `;
    if (inProduction > 0) {
      aiInsights += `${inProduction} sedang dalam produksi. `;
    }
    if (budgetUsage > 80) {
      aiInsights += `Perhatian: Budget sudah terpakai ${budgetUsage}%. `;
    } else {
      aiInsights += `Budget masih sehat dengan penggunaan ${budgetUsage}%. `;
    }
    aiInsights += 'Tetap semangat berkarya!';

    return NextResponse.json({
      aiInsights,
      todayTasks,
      recommendations: [
        'Fokus selesaikan video yang sedang produksi',
        'Review timeline untuk deadline mendatang',
        'Cek performa video yang sudah publish',
      ],
    });
  } catch (error) {
    console.error('Briefing error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}