import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaLibSql({
      url: process.env.TURSO_DATABASE_URL || 'file:./dev.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    super({
      // @ts-ignore
      adapter,
      log: process.env.NODE_ENV === 'development' 
        ? ['warn', 'error']
        : ['error'],
    } as any);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
