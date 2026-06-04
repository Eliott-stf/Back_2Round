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
  console.log('Debut du seed...');

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
      height: 180,
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
      height: 178,
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

  console.log('Users crees');

  const walletJohn = await prisma.wallet.upsert({
    where: { userId: john.id },
    update: { balance: 500 },
    create: { balance: 500, userId: john.id },
  });

  const walletMike = await prisma.wallet.upsert({
    where: { userId: mike.id },
    update: { balance: 1000 },
    create: { balance: 1000, userId: mike.id },
  });

  await prisma.transaction.createMany({
    data: [
      { amount: 500, type: 'CREDIT', description: 'Initial deposit', walletId: walletJohn.id },
      { amount: 1000, type: 'CREDIT', description: 'Initial deposit', walletId: walletMike.id },
    ],
  });

  console.log('Wallets crees');

  const addressJohn = await prisma.address.upsert({
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

  const addressMike = await prisma.address.upsert({
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

  await prisma.bankAccount.createMany({
    data: [
      { iban: 'FR7630000000000000000000001', bic: 'TRFXFR01', ownerName: 'John Doe', isDefault: true, userId: john.id },
      { iban: 'FR7630000000000000000000002', bic: 'TRFXFR02', ownerName: 'Mike Tyson', isDefault: true, userId: mike.id },
    ],
  });

  console.log('Adresses creees');

  const catGants = await prisma.category.upsert({
    where: { slug: 'gants' },
    update: {},
    create: { name: 'Gants', slug: 'gants' },
  });

  const catCasques = await prisma.category.upsert({
    where: { slug: 'casques' },
    update: {},
    create: { name: 'Casques', slug: 'casques' },
  });

  const catChaussures = await prisma.category.upsert({
    where: { slug: 'chaussures' },
    update: {},
    create: { name: 'Chaussures', slug: 'chaussures' },
  });

  const catHauts = await prisma.category.upsert({
    where: { slug: 'hauts' },
    update: {},
    create: { name: 'Hauts', slug: 'hauts' },
  });

  const catShorts = await prisma.category.upsert({
    where: { slug: 'shorts' },
    update: {},
    create: { name: 'Shorts', slug: 'shorts' },
  });

  const catProtections = await prisma.category.upsert({
    where: { slug: 'protections' },
    update: {},
    create: { name: 'Protections', slug: 'protections' },
  });

  // PRODUIT 1 : Gants - Vendeur John
  const product1 = await prisma.product.create({
    data: {
      title: 'Gants Everlast Pro 14oz',
      description: 'Gants de boxe en excellent état.',
      condition: 'GOOD',
      size: '14oz',
      price: 45,
      sellerId: john.id,
      categoryId: catGants.id,
    },
  });

  // PRODUIT 2 : Casque - Vendeur Mike
  const product2 = await prisma.product.create({
    data: {
      title: 'Casque Rival RHG20',
      description: 'Casque de protection haut de gamme.',
      condition: 'VERY_GOOD',
      price: 80,
      sellerId: mike.id,
      categoryId: catCasques.id,
    },
  });

  // PRODUIT 3 : Casque - Vendeur John (Nouveau)
  const product3 = await prisma.product.create({
    data: {
      title: 'Casque Venum Elite',
      description: 'Casque noir, très peu servi, excellente protection.',
      condition: 'GOOD',
      price: 65,
      sellerId: john.id,
      categoryId: catCasques.id,
    },
  });

  // PRODUIT 4 : Gants - Vendeur Mike (Nouveau)
  const product4 = await prisma.product.create({
    data: {
      title: 'Gants Cleto Reyes 16oz',
      description: 'Gants d\'entraînement professionnels.',
      condition: 'GOOD',
      size: '16oz',
      price: 120,
      sellerId: mike.id,
      categoryId: catGants.id,
    },
  });

  console.log('Produits crees');

  const allProducts = await prisma.product.findMany({
    select: { id: true },
  });

  await prisma.media.createMany({
    data: allProducts.map((p) => ({
      path: '/uploads/products/salut.png',
      productId: p.id,
    })),
  });

  console.log('Medias crees');

  await prisma.userProduct.createMany({
    data: [
      { userId: mike.id, productId: product1.id },
      { userId: john.id, productId: product2.id },
    ],
  });

  const order1 = await prisma.order.create({
    data: {
      reference: 'ORD-001',
      status: 'DELIVERED',
      totalAmount: 45,
      buyerId: mike.id,
      shippingAddressId: addressMike.id,
      billingAddressId: addressMike.id,
    },
  });

  const order2 = await prisma.order.create({
    data: {
      reference: 'ORD-002',
      status: 'DELIVERED',
      totalAmount: 80,
      buyerId: john.id,
      shippingAddressId: addressJohn.id,
      billingAddressId: addressJohn.id,
    },
  });

  await prisma.orderItem.createMany({
    data: [
      { quantity: 1, unitPriceAtPurchase: 45, orderId: order1.id, productId: product1.id },
      { quantity: 1, unitPriceAtPurchase: 80, orderId: order2.id, productId: product2.id },
    ],
  });

  await prisma.facture.createMany({
    data: [
      { reference: 'FAC-001', client: 'Mike Tyson', path: '/factures/fac-001.pdf', orderId: order1.id },
      { reference: 'FAC-002', client: 'John Doe', path: '/factures/fac-002.pdf', orderId: order2.id },
    ],
  });

  await prisma.review.createMany({
    data: [
      { rating: 5, comment: 'Excellent état, envoi rapide.', orderId: order1.id },
      { rating: 4, comment: 'Bon produit, mais emballage abîmé.', orderId: order2.id },
    ],
  });

  const conversation1 = await prisma.conversation.create({
    data: { productId: product1.id, buyerId: mike.id },
  });

  const conversation2 = await prisma.conversation.create({
    data: { productId: product2.id, buyerId: john.id },
  });

  await prisma.message.createMany({
    data: [
      { content: 'Bonjour, toujours disponible ?', senderId: mike.id, conversationId: conversation1.id },
      { content: 'Oui, je vous le fais à 40€.', senderId: john.id, conversationId: conversation1.id },
      { content: 'Est-ce que le casque taille grand ?', senderId: john.id, conversationId: conversation2.id },
      { content: 'C\'est une taille standard.', senderId: mike.id, conversationId: conversation2.id },
    ],
  });

  await prisma.offer.createMany({
    data: [
      { proposedPrice: 40, status: 'ACCEPTED', conversationId: conversation1.id, productId: product1.id },
      { proposedPrice: 70, status: 'DECLINED', conversationId: conversation2.id, productId: product2.id },
    ],
  });

  const typeArnaque = await prisma.typeReport.upsert({
    where: { label: 'Arnaque' },
    update: {},
    create: { label: 'Arnaque' },
  });

  const typeInapproprie = await prisma.typeReport.upsert({
    where: { label: 'Contenu inapproprié' },
    update: {},
    create: { label: 'Contenu inapproprié' },
  });

  await prisma.report.createMany({
    data: [
      { content: 'Le vendeur ne répond plus', status: 'OPEN', userId: mike.id, productId: product1.id, typeReportId: typeArnaque.id },
      { content: 'Insultes dans les messages', status: 'RESOLVED', userId: john.id, conversationId: conversation2.id, typeReportId: typeInapproprie.id },
    ],
  });

  console.log('Seed termine avec succes !');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());