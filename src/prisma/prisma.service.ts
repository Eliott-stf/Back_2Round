import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        let host = '127.0.0.1';
        let port = Number(process.env.MARIADB_PORT || 3306);
        let user = process.env.MYSQL_USER;
        let password = process.env.MYSQL_PASSWORD;
        let database = process.env.MYSQL_DATABASE;

        const dbUrl = process.env.DATABASE_URL;
        if (dbUrl) {
            try {
                const url = new URL(dbUrl);
                host = url.hostname;
                port = url.port ? Number(url.port) : 3306;
                user = url.username;
                password = decodeURIComponent(url.password);
                database = url.pathname.replace(/^\//, '');
            } catch (e) {
                console.error("Failed to parse DATABASE_URL in PrismaService:", e);
            }
        }

        const adapter = new PrismaMariaDb({
            host,
            port,
            user,
            password,
            database,
            connectionLimit: 10,
        });
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}