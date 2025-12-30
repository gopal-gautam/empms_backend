import 'dotenv/config';
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg'; // Import the pg driver
// import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy{
    constructor() {
        // Retrieve the connection string from environment variables
        const connectionString = process.env.DATABASE_URL as string;

        // Instantiate the node-postgres driver client
        const pgClient = new pg.Client({ connectionString });
        
        // Instantiate the PrismaPg adapter
        const adapter = new PrismaPg(pgClient); // Pass the pg client instance
        super({adapter});
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}