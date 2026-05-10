import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Email, password and name required' },
        { status: 400 }
      );
    }

    const existing = await db.execute({
      sql: 'SELECT id FROM User WHERE email = ?',
      args: [email],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO User (id, email, password, name, role, isActive, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, 'admin', 1, datetime('now'), datetime('now'))`,
      args: [id, email, hashedPassword, name],
    });

    const token = jwt.sign(
      { sub: id, email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      access_token: token,
      user: { id, email, name, role: 'admin' },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
