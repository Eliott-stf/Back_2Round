import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
import { PrismaClient } from '../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

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
  console.log('🌱 Début du seed...');

  // ================================
  // USERS
  // ================================
  const hashedPassword = await bcrypt.hash('password123', 10);

  const john = await prisma.user.upsert({
    where: { email: 'john@test.com' },
    update: {},
    create: {
      name: 'John',
      lastname: 'Doe',
      email: 'john@test.com',
      password: hashedPassword,
      role: 'USER',
      boxingType: 'Muay Thai',
      weight: 75,
    },
  });

  const mike = await prisma.user.upsert({
    where: { email: 'mike@2round.com' },
    update: {},
    create: {
      name: 'Mike',
      lastname: 'Tyson',
      email: 'mike@2round.com',
      password: hashedPassword,
      role: 'USER',
      boxingType: 'Boxe Anglaise',
      weight: 95,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@2round.com' },
    update: {},
    create: {
      name: 'Admin',
      lastname: 'Boxing',
      email: 'admin@2round.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Users créés');

  // ================================
  // WALLETS
  // ================================
  await prisma.wallet.upsert({
    where: { userId: john.id },
    update: { balance: 500 },
    create: { balance: 500, userId: john.id },
  });

  await prisma.wallet.upsert({
    where: { userId: mike.id },
    update: { balance: 1000 },
    create: { balance: 1000, userId: mike.id },
  });

  await prisma.wallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: { balance: 0, userId: admin.id },
  });

  console.log('✅ Wallets créés');

  // ================================
  // ADRESSES
  // ================================
  const johnAddress = await prisma.address.upsert({
    where: { id: 'address-john-1' },
    update: {},
    create: {
      id: 'address-john-1',
      type: 'SHIPPING',
      streetName: 'Rue de la Boxe',
      city: 'Marseille',
      zipCode: '13000',
      userId: john.id,
    },
  });

  const mikeAddress = await prisma.address.upsert({
    where: { id: 'address-mike-1' },
    update: {},
    create: {
      id: 'address-mike-1',
      type: 'SHIPPING',
      streetName: 'Rue du Combat',
      city: 'Paris',
      zipCode: '75001',
      userId: mike.id,
    },
  });

  console.log('✅ Adresses créées');

  // ================================
  // CATEGORIES
  // ================================
  const catGants = await prisma.category.upsert({
    where: { slug: 'gants' },
    update: {},
    create: { name: 'Gants', slug: 'gants' },
  });

  await prisma.category.upsert({
    where: { slug: 'gants-sparring' },
    update: {},
    create: { name: 'Gants de sparring', slug: 'gants-sparring', parentId: catGants.id },
  });

  const catCasques = await prisma.category.upsert({
    where: { slug: 'casques' },
    update: {},
    create: { name: 'Casques', slug: 'casques' },
  });

  const catSacs = await prisma.category.upsert({
    where: { slug: 'sacs' },
    update: {},
    create: { name: 'Sacs de frappe', slug: 'sacs' },
  });

  const catTenues = await prisma.category.upsert({
    where: { slug: 'tenues' },
    update: {},
    create: { name: 'Tenues', slug: 'tenues' },
  });

  const catProtege = await prisma.category.upsert({
    where: { slug: 'protege-dents' },
    update: {},
    create: { name: 'Protège-dents', slug: 'protege-dents' },
  });

  console.log('✅ Catégories créées');

  // ================================
  // PRODUITS
  // ================================
  const produits = [
    {
      title: 'Gants Everlast Pro 14oz',
      description: 'Gants de boxe en excellent état, utilisés 3 fois seulement. Idéal pour le sparring.',
      condition: 'GOOD',
      size: '14oz',
      price: 45,
      sellerId: john.id,
      categoryId: catGants.id,
    },
    {
      title: 'Casque Rival RHG20',
      description: 'Casque de protection haut de gamme, très bon état. Protection maximale.',
      condition: 'VERY_GOOD',
      price: 80,
      sellerId: john.id,
      categoryId: catCasques.id,
    },
    {
      title: 'Sac de frappe Adidas 100kg',
      description: 'Sac de frappe professionnel, légèrement usé mais très solide.',
      condition: 'FAIR',
      price: 120,
      sellerId: john.id,
      categoryId: catSacs.id,
    },
    {
      title: 'Short de boxe Venum',
      description: 'Short Muay Thai, taille L, porté 5 fois. Très bon état.',
      condition: 'GOOD',
      size: 'L',
      price: 35,
      sellerId: mike.id,
      categoryId: catTenues.id,
    },
    {
      title: 'Protège-dents Shock Doctor',
      description: 'Protège-dents neuf, jamais utilisé. Taille adulte.',
      condition: 'NEW',
      price: 15,
      sellerId: mike.id,
      categoryId: catProtege.id,
    },
    {
      title: 'Gants Hayabusa T3 16oz',
      description: 'Gants premium quasi neufs, 2 entraînements seulement.',
      condition: 'NEW',
      size: '16oz',
      price: 95,
      sellerId: mike.id,
      categoryId: catGants.id,
    },
  ];

  for (const produit of produits) {
    await prisma.product.create({ data: produit as any });
  }

  console.log('✅ Produits créés');

  // ================================
  // TYPE REPORTS
  // ================================
  await prisma.typeReport.upsert({
    where: { label: 'Arnaque' },
    update: {},
    create: { label: 'Arnaque' },
  });

  await prisma.typeReport.upsert({
    where: { label: 'Contenu inapproprié' },
    update: {},
    create: { label: 'Contenu inapproprié' },
  });

  await prisma.typeReport.upsert({
    where: { label: 'Harcèlement' },
    update: {},
    create: { label: 'Harcèlement' },
  });

  console.log('✅ TypeReports créés');
  console.log('🎉 Seed terminé avec succès !');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());