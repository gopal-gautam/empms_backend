import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const databaseProvider = process.env.DATABASE_PROVIDER;

        if (databaseProvider === 'sqlite') {
            const url = process.env.DATABASE_URL ?? 'file:./dev.db';
            const adapter = new PrismaBetterSqlite3({ url });
            super({ adapter } as any);
        } else {
            // @ts-ignore - PostgreSQL doesn't need adapter
            super();
        }
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}