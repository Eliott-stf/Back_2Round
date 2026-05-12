
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
  await prisma.wallet.create({
    data: {
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
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());