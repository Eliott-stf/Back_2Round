
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
import { PrismaClient } from '../src/generated/prisma/client';

dotenv.config();

const adapter = new PrismaMariaDb({
  host: '127.0.0.1',
  port: Number(process.env.MARIADB_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 10,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Wallet pour John Doe
  await prisma.wallet.upsert({
    where: { userId: 'fdb641a5-61bc-4be4-a74f-d46c7e3e094b' },
    update: { balance: 500 },
    create: {
      balance: 500,
      userId: 'fdb641a5-61bc-4be4-a74f-d46c7e3e094b',
    },
  });

  // Adresse pour John Doe
  await prisma.address.create({
    data: {
      type: 'SHIPPING',
      streetName: 'Rue de la Boxe',
      city: 'Marseille',
      zipCode: '13000',
      userId: 'fdb641a5-61bc-4be4-a74f-d46c7e3e094b',
    },
  });

  console.log('Seed terminé ✅');

  //Adresse pour mike
  await prisma.address.create({
    data: {
      type: 'SHIPPING',
      streetName: 'Rue du Combat',
      city: 'Paris',
      zipCode: '75001',
      userId: '6dbaaaaa-c3f0-4be2-b596-7f14d3c3bc3f',
    },
  });

  // Wallet pour Mike
  await prisma.wallet.upsert({
    where: { userId: '6dbaaaaa-c3f0-4be2-b596-7f14d3c3bc3f' },
    update: { balance: 1000 },
    create: {
      balance: 1000,
      userId: '6dbaaaaa-c3f0-4be2-b596-7f14d3c3bc3f',
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());