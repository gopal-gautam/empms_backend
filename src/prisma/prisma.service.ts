import 'dotenv/config';
import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Prisma, PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private pgPool: pg.Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL as string;

    // Use a connection pool (allows concurrent queries)
    const pgPool = new pg.Pool({
      connectionString,
      max: Number(process.env.PG_POOL_MAX) || 10,
      // optional: idleTimeoutMillis, connectionTimeoutMillis
    });

    pgPool.on('error', (err) => {
      const logger = new Logger(PrismaService.name);
      logger.error('Postgres pool error', err);
    });

    const adapter = new PrismaPg(pgPool);
    super({
      log: [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error'],
      adapter,
    } as Prisma.PrismaClientOptions);

    this.pgPool = pgPool;

    // optional: warn about pool size
    this.logger.log(`Postgres pool created (max=${Number(process.env.PG_POOL_MAX) || 10})`);
  }

  async onModuleInit() {
    // Log each Prisma query to see durations
    // this.$on('query' as never, (e: any) =>
    //   this.logger.debug(`[Prisma] query: ${e.query} params: ${e.params} duration: ${e.duration}`),
    // );

    // this.$on('error' as never, (e) => this.logger.error('[Prisma] error', e));
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    // close the pool
    await this.pgPool.end();
    this.logger.log('Postgres pool closed');
  }
}