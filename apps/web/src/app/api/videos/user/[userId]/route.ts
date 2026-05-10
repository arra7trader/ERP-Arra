import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM Video WHERE userId = ? ORDER BY createdAt DESC',
      args: [params.userId],
    });
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}