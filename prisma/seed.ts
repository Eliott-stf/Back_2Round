import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
import { PrismaClient } from '../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

dotenv.config();

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
    console.error("Failed to parse DATABASE_URL in seed.ts:", e);
  }
}

const adapter = new PrismaMariaDb({
  host,
  port,
  user,
  password,
  database,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Nettoyage de la base de donnees...');
  
  // Supprimer dans l'ordre pour respecter les cles etrangeres
  await prisma.productAttribute.deleteMany();
  await prisma.attribute.deleteMany();
  await prisma.report.deleteMany();
  await prisma.typeReport.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.facture.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.userProduct.deleteMany();
  await prisma.media.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  console.log('Base de donnees nettoyee.');
  console.log('Debut du seed enrichi...');

  const hashedPassword = await bcrypt.hash('password123', 10);
  const hashedJulien = await bcrypt.hash('Julien@2025', 10);
  const hashedSebastien = await bcrypt.hash('faure@2025', 10);
  const hashedEliott = await bcrypt.hash('Eliott@2025', 10);

  // 1. Creation des 10 utilisateurs (dont John, Mike, Admin et les 3 nouveaux)
  const usersData = [
    { name: 'John', lastname: 'Doe', email: 'john@test.com', password: hashedPassword, role: 'USER' as const, boxingType: 'Muay Thai', weight: 75, height: 180 },
    { name: 'Mike', lastname: 'Tyson', email: 'mike@2round.com', password: hashedPassword, role: 'USER' as const, boxingType: 'Boxe Anglaise', weight: 95, height: 178 },
    { name: 'Admin', lastname: 'Boxing', email: 'admin@2round.com', password: hashedPassword, role: 'ADMIN' as const, boxingType: 'Savate', weight: 80, height: 185 },
    { name: 'Sarah', lastname: 'Connor', email: 'sarah@test.com', password: hashedPassword, role: 'USER' as const, boxingType: 'Kickboxing', weight: 62, height: 170 },
    { name: 'Tony', lastname: 'Montana', email: 'tony@test.com', password: hashedPassword, role: 'USER' as const, boxingType: 'Boxe Anglaise', weight: 81, height: 175 },
    { name: 'Ali', lastname: 'Clay', email: 'ali@test.com', password: hashedPassword, role: 'USER' as const, boxingType: 'Boxe Anglaise', weight: 98, height: 191 },
    { name: 'Leila', lastname: 'Amara', email: 'leila@test.com', password: hashedPassword, role: 'USER' as const, boxingType: 'Krav Maga', weight: 55, height: 165 },
    { name: 'Julien', lastname: 'Linard', email: 'julien@linard.com', password: hashedJulien, role: 'ADMIN' as const, boxingType: 'Boxe Anglaise', weight: 70, height: 175 },
    { name: 'Sebastien', lastname: 'Faure', email: 'sebastien@faure.com', password: hashedSebastien, role: 'ADMIN' as const, boxingType: 'Kickboxing', weight: 85, height: 182 },
    { name: 'Eliott', lastname: 'Setif', email: 'eliott@setif.com', password: hashedEliott, role: 'ADMIN' as const, boxingType: 'Muay Thai', weight: 78, height: 180 },
  ];

  const createdUsers: any[] = [];
  for (const u of usersData) {
    const user = await prisma.user.create({ data: u });
    createdUsers.push(user);
  }
  console.log('10 Utilisateurs crees.');

  // Separation des roles pour faciliter la suite
  const john = createdUsers.find(u => u.email === 'john@test.com')!;
  const mike = createdUsers.find(u => u.email === 'mike@2round.com')!;
  const admin = createdUsers.find(u => u.email === 'admin@2round.com')!;
  const julien = createdUsers.find(u => u.email === 'julien@linard.com')!;
  const sebastien = createdUsers.find(u => u.email === 'sebastien@faure.com')!;
  const eliott = createdUsers.find(u => u.email === 'eliott@setif.com')!;
  const otherUsers = createdUsers.filter(u => u.id !== admin.id);

  // 2. Wallets, Transactions, Adresses et Comptes bancaires pour tous les utilisateurs
  const createdWallets: any[] = [];
  for (let i = 0; i < createdUsers.length; i++) {
    const user = createdUsers[i];
    const balance = (user.role === 'ADMIN' && user.email === 'admin@2round.com') ? 0 : (100 + i * 150);
    
    // Wallet
    const wallet = await prisma.wallet.create({
      data: { balance, userId: user.id }
    });
    createdWallets.push(wallet);

    // Depot initial
    if (balance > 0) {
      await prisma.transaction.create({
        data: { amount: balance, type: 'CREDIT', description: 'Depot de bienvenue', walletId: wallet.id }
      });
    }

    // Adresse de livraison
    await prisma.address.create({
      data: {
        type: 'SHIPPING',
        streetName: `Rue du Combat ${10 + i}`,
        city: i % 2 === 0 ? 'Paris' : 'Marseille',
        zipCode: i % 2 === 0 ? '75010' : '13002',
        userId: user.id,
      }
    });

    // Adresse de facturation
    await prisma.address.create({
      data: {
        type: 'BILLING',
        streetName: `Rue de la Paix ${10 + i}`,
        city: i % 2 === 0 ? 'Paris' : 'Marseille',
        zipCode: i % 2 === 0 ? '75010' : '13002',
        userId: user.id,
      }
    });

    // Compte bancaire
    await prisma.bankAccount.create({
      data: {
        iban: `FR763000000000000000000000${i + 1}`,
        bic: 'BOXXFR2P',
        ownerName: `${user.name} ${user.lastname}`,
        isDefault: true,
        userId: user.id
      }
    });
  }
  console.log('Wallets, adresses, transactions et comptes bancaires initialises.');

  // 3. Creation des categories
  const catGants = await prisma.category.create({ data: { name: 'Gants', slug: 'gants' } });
  const catCasques = await prisma.category.create({ data: { name: 'Casques', slug: 'casques' } });
  const catProtections = await prisma.category.create({ data: { name: 'Protections', slug: 'protections' } });
  const catChaussures = await prisma.category.create({ data: { name: 'Chaussures', slug: 'chaussures' } });
  const catVetements = await prisma.category.create({ data: { name: 'Vêtements', slug: 'vetements' } });

  console.log('Categories creees.');

  // 3b. Creation des attributes
  const gloveSizes = ['8oz', '10oz', '12oz', '14oz', '16oz'];
  const shoeSizes = ['38', '39', '40', '41', '42', '43', '44', '45'];
  const clothingSizes = ['XS', 'S', 'M', 'L', 'XL'];

  const seededAttributes: { [key: string]: any } = {};

  for (const val of gloveSizes) {
    seededAttributes[`size_glove_${val}`] = await prisma.attribute.create({
      data: { type: 'size_glove', value: val }
    });
  }
  for (const val of shoeSizes) {
    seededAttributes[`size_shoe_${val}`] = await prisma.attribute.create({
      data: { type: 'size_shoe', value: val }
    });
  }
  for (const val of clothingSizes) {
    seededAttributes[`size_clothing_${val}`] = await prisma.attribute.create({
      data: { type: 'size_clothing', value: val }
    });
  }

  console.log('Attributs de taille crees.');

  // 4. Creation des 50 produits (repartis entre les 6 utilisateurs non-admins)
  const productTemplates = [
    // --- GANANTS (Catégorie Gants) ---
    { title: 'Gants Everlast Pro Style', categoryId: catGants.id, folder: 'gant', ext: 'jpeg', basePrice: 40, size: '12oz' },
    { title: 'Gants Cleto Reyes Velcro', categoryId: catGants.id, folder: 'gant', ext: 'jpeg', basePrice: 190, size: '14oz' },
    { title: 'Gants Venum Challenger 3.0', categoryId: catGants.id, folder: 'gant', ext: 'jpeg', basePrice: 45, size: '10oz' },
    { title: 'Gants Hayabusa T3 Boxe', categoryId: catGants.id, folder: 'gant', ext: 'jpeg', basePrice: 130, size: '16oz' },
    { title: 'Gants Fairtex BGV1 Muay Thai', categoryId: catGants.id, folder: 'gant', ext: 'jpeg', basePrice: 95, size: '14oz' },
    { title: 'Gants Adidas Hybrid 150', categoryId: catGants.id, folder: 'gant', ext: 'jpeg', basePrice: 35, size: '12oz' },
    { title: 'Gants Twins Special Cuir', categoryId: catGants.id, folder: 'gant', ext: 'jpeg', basePrice: 110, size: '14oz' },
    { title: 'Gants Winning MS-600 Lace', categoryId: catGants.id, folder: 'gant', ext: 'png', basePrice: 450, size: '16oz', isFirst: true },
    { title: 'Gants Leone 1947 Shock', categoryId: catGants.id, folder: 'gant', ext: 'jpeg', basePrice: 60, size: '12oz' },
    { title: 'Gants de combat Ringhorns', categoryId: catGants.id, folder: 'gant', ext: 'jpeg', basePrice: 25, size: '10oz' },
    { title: 'Gants Venum Elite Noir', categoryId: catGants.id, folder: 'gant', ext: 'jpeg', basePrice: 75, size: '14oz' },
    { title: 'Gants Rival RB11 Ultra Bag', categoryId: catGants.id, folder: 'gant', ext: 'jpeg', basePrice: 125, size: '12oz' },
    { title: 'Gants Lonsdale Authentic', categoryId: catGants.id, folder: 'gant', ext: 'jpeg', basePrice: 30, size: '14oz' },
    { title: 'Gants RDX Ego Series', categoryId: catGants.id, folder: 'gant', ext: 'jpeg', basePrice: 40, size: '12oz' },
    { title: 'Gants Fly Superlace', categoryId: catGants.id, folder: 'gant', ext: 'jpeg', basePrice: 280, size: '14oz' },
    { title: 'Gants de sac Adidas Speed', categoryId: catGants.id, folder: 'gant', ext: 'jpeg', basePrice: 30, size: '10oz' },
    { title: 'Gants Bad Boy Legacy', categoryId: catGants.id, folder: 'gant', ext: 'jpeg', basePrice: 50, size: '16oz' },
    { title: 'Gants Venum Giant 3.0', categoryId: catGants.id, folder: 'gant', ext: 'jpeg', basePrice: 85, size: '14oz' },
    
    // --- CASQUES (Catégorie Casques) ---
    { title: 'Casque Rival RHG20 Pro', categoryId: catCasques.id, folder: 'casque', ext: 'jpeg', basePrice: 85, size: 'M' },
    { title: 'Casque Venum Elite Integral', categoryId: catCasques.id, folder: 'casque', ext: 'jpeg', basePrice: 60, size: 'L' },
    { title: 'Casque Winning FG-2900 Noir', categoryId: catCasques.id, folder: 'casque', ext: 'jpeg', basePrice: 320, size: 'M' },
    { title: 'Casque Cleto Reyes Facebar', categoryId: catCasques.id, folder: 'casque', ext: 'jpeg', basePrice: 195, size: 'L' },
    { title: 'Casque Fairtex Super Sparring', categoryId: catCasques.id, folder: 'casque', ext: 'jpeg', basePrice: 90, size: 'S' },
    { title: 'Casque Everlast Elite Facebar', categoryId: catCasques.id, folder: 'casque', ext: 'jpeg', basePrice: 110, size: 'L' },
    { title: 'Casque RDX T1 protection nez', categoryId: catCasques.id, folder: 'casque', ext: 'jpeg', basePrice: 45, size: 'XL' },
    { title: 'Casque Metal Boxe Integral', categoryId: catCasques.id, folder: 'casque', ext: 'jpeg', basePrice: 30, size: 'M' },
    { title: 'Casque Adidas Super Pro', categoryId: catCasques.id, folder: 'casque', ext: 'jpeg', basePrice: 70, size: 'M' },
    { title: 'Casque Leone Combat Sport', categoryId: catCasques.id, folder: 'casque', ext: 'jpeg', basePrice: 55, size: 'L' },
    { title: 'Casque Venum Challenger', categoryId: catCasques.id, folder: 'casque', ext: 'jpeg', basePrice: 40, size: 'M' },
    { title: 'Casque Ringhorns Charger', categoryId: catCasques.id, folder: 'casque', ext: 'jpeg', basePrice: 25, size: 'S' },
    { title: 'Casque de protection Bad Boy', categoryId: catCasques.id, folder: 'casque', ext: 'jpeg', basePrice: 35, size: 'L' },
    { title: 'Casque Rival Guerrero Bar', categoryId: catCasques.id, folder: 'casque', ext: 'jpeg', basePrice: 180, size: 'M' },
    { title: 'Casque Phantom Athletics', categoryId: catCasques.id, folder: 'casque', ext: 'jpeg', basePrice: 65, size: 'M' },

    // --- BANDES / PROTECTIONS (Catégorie Protections) ---
    { title: 'Bandes Venum Kontact 4m', categoryId: catProtections.id, folder: 'bande', ext: 'jpeg', basePrice: 10, size: '4m' },
    { title: 'Bandes Fairtex Elastic Muay', categoryId: catProtections.id, folder: 'bande', ext: 'jpeg', basePrice: 15, size: '4.5m' },
    { title: 'Bandes de boxe Adidas Crepe', categoryId: catProtections.id, folder: 'bande', ext: 'jpeg', basePrice: 8, size: '3m' },
    { title: 'Bandes Everlast 120 Pro', categoryId: catProtections.id, folder: 'bande', ext: 'jpeg', basePrice: 9, size: '3.2m' },
    { title: 'Bandes Twins Special Semi-Elastic', categoryId: catProtections.id, folder: 'bande', ext: 'jpeg', basePrice: 12, size: '4m' },
    { title: 'Chevillere de protection Venum', categoryId: catProtections.id, folder: 'bande', ext: 'jpeg', basePrice: 18, size: 'M' },
    { title: 'Coudiere Muay Thai RDX', categoryId: catProtections.id, folder: 'bande', ext: 'jpeg', basePrice: 20, size: 'L' },
    { title: 'Mitaines sous-gants gel Leone', categoryId: catProtections.id, folder: 'bande', ext: 'jpeg', basePrice: 22, size: 'M' },
    { title: 'Protege-dents Venum Challenger', categoryId: catProtections.id, folder: 'bande', ext: 'jpeg', basePrice: 14, size: 'Adulte' },
    { title: 'Protege-dents Shock Doctor Gel', categoryId: catProtections.id, folder: 'bande', ext: 'jpeg', basePrice: 25, size: 'Adulte' },
    { title: 'Coquille de protection metal Leone', categoryId: catProtections.id, folder: 'bande', ext: 'jpeg', basePrice: 40, size: 'M' },
    { title: 'Chevillere Elastic Bad Boy', categoryId: catProtections.id, folder: 'bande', ext: 'jpeg', basePrice: 10, size: 'S' },
    { title: 'Coquille compression Shock Doctor', categoryId: catProtections.id, folder: 'bande', ext: 'jpeg', basePrice: 35, size: 'L' },
    { title: 'Mitaines de sous-gants Adidas', categoryId: catProtections.id, folder: 'bande', ext: 'jpeg', basePrice: 15, size: 'M' },
    { title: 'Bandes de boxe Phantom', categoryId: catProtections.id, folder: 'bande', ext: 'jpeg', basePrice: 10, size: '4m' },
    { title: 'Bandes Leone Rouge 4.5m', categoryId: catProtections.id, folder: 'bande', ext: 'jpeg', basePrice: 12, size: '4.5m' },
    { title: 'Bandes Everlast Classic Noir', categoryId: catProtections.id, folder: 'bande', ext: 'jpeg', basePrice: 8, size: '3m' },
    { title: 'Bandes Venum Classic Bleu', categoryId: catProtections.id, folder: 'bande', ext: 'jpeg', basePrice: 10, size: '4m' },
    { title: 'Protege tibias Venum Challenger', categoryId: catProtections.id, folder: 'bande', ext: 'jpeg', basePrice: 55, size: 'M' },

    // --- CHAUSSURES (Catégorie Chaussures) ---
    { title: 'Chaussures de boxe Adidas Box Hog', categoryId: catChaussures.id, folder: 'bande', ext: 'jpeg', basePrice: 85, size: '42' },
    { title: 'Chaussures Everlast Elite', categoryId: catChaussures.id, folder: 'bande', ext: 'jpeg', basePrice: 95, size: '43' },
    { title: 'Chaussures Nike Machomai', categoryId: catChaussures.id, folder: 'bande', ext: 'jpeg', basePrice: 110, size: '41' },

    // --- VÊTEMENTS (Catégorie Vêtements) ---
    { title: 'Short de boxe Venum Classic', categoryId: catVetements.id, folder: 'bande', ext: 'jpeg', basePrice: 30, size: 'M' },
    { title: 'T-shirt de compression Under Armour', categoryId: catVetements.id, folder: 'bande', ext: 'jpeg', basePrice: 35, size: 'L' },
    { title: 'Sweat à capuche Boxing Club', categoryId: catVetements.id, folder: 'bande', ext: 'jpeg', basePrice: 45, size: 'XL' },
  ];

  const conditions = ['NEW', 'VERY_GOOD', 'GOOD', 'FAIR'] as const;
  const createdProducts: any[] = [];

  for (let i = 0; i < 50; i++) {
    const template = productTemplates[i % productTemplates.length];
    
    // Assigner un vendeur cyclique parmi les utilisateurs non-admins
    const seller = otherUsers[i % otherUsers.length];

    // Varier le prix de base
    const priceVariance = (i % 5) * 5 - 10;
    const finalPrice = Math.max(5, template.basePrice + priceVariance);

    const condition = conditions[i % conditions.length];

    // Creer le produit
    const product = await prisma.product.create({
      data: {
        title: `${template.title} #${i + 1}`,
        description: `Excellent equipement de boxe. Parfait pour l'entrainement quotidien en club. Très confortable et durable dans le temps. Vente cause double emploi.`,
        condition,
        price: finalPrice,
        sellerId: seller.id,
        categoryId: template.categoryId,
        status: 'AVAILABLE'
      }
    });

    // Assigner l'attribut correspondant si la categorie possede des tailles
    let attrKey = '';
    if (template.categoryId === catGants.id) {
      const sizeVal = gloveSizes.includes(template.size || '') ? template.size : '12oz';
      attrKey = `size_glove_${sizeVal}`;
    } else if (template.categoryId === catChaussures.id) {
      const sizeVal = shoeSizes.includes(template.size || '') ? template.size : '42';
      attrKey = `size_shoe_${sizeVal}`;
    } else if (template.categoryId === catVetements.id || template.categoryId === catCasques.id) {
      const sizeVal = clothingSizes.includes(template.size || '') ? template.size : 'M';
      attrKey = `size_clothing_${sizeVal}`;
    }

    if (attrKey && seededAttributes[attrKey]) {
      await prisma.productAttribute.create({
        data: {
          productId: product.id,
          attributeId: seededAttributes[attrKey].id
        }
      });
    }

    createdProducts.push(product);

    // Assigner l'image correspondante
    let imgName = '';
    if (template.folder === 'gant') {
      const idx = (i % 6) + 1;
      imgName = idx === 1 ? '1.png' : `${idx}.jpeg`;
    } else if (template.folder === 'casque') {
      imgName = `${(i % 6) + 1}.jpeg`;
    } else {
      imgName = `${(i % 4) + 1}.jpeg`;
    }

    const imgPath = `/images/${template.folder}/${imgName}`;

    await prisma.media.create({
      data: {
        path: imgPath,
        productId: product.id
      }
    });
  }

  console.log('50 Produits et leurs medias associes crees.');

  // 4b. Création de 5 produits spécifiques pour les 3 nouveaux utilisateurs
  const newProductsData = [
    { title: 'Gants Reyes Pro Julien', price: 150, sellerId: julien.id, categoryId: catGants.id, condition: 'VERY_GOOD' as const, imgFolder: 'gant', imgName: '2.jpeg', attrKey: `size_glove_14oz` },
    { title: 'Casque Protect Julien', price: 80, sellerId: julien.id, categoryId: catCasques.id, condition: 'NEW' as const, imgFolder: 'casque', imgName: '1.jpeg', attrKey: `size_clothing_M` },
    { title: 'Chaussures Adidas Sebastien', price: 90, sellerId: sebastien.id, categoryId: catChaussures.id, condition: 'GOOD' as const, imgFolder: 'bande', imgName: '1.jpeg', attrKey: `size_shoe_43` },
    { title: 'Short Venum Sebastien', price: 25, sellerId: sebastien.id, categoryId: catVetements.id, condition: 'VERY_GOOD' as const, imgFolder: 'bande', imgName: '2.jpeg', attrKey: `size_clothing_L` },
    { title: 'Protege tibias Eliott', price: 40, sellerId: eliott.id, categoryId: catProtections.id, condition: 'NEW' as const, imgFolder: 'bande', imgName: '3.jpeg', attrKey: `size_clothing_M` },
  ];

  const newProducts: any[] = [];
  for (const p of newProductsData) {
    const product = await prisma.product.create({
      data: {
        title: p.title,
        description: `Excellent equipement de boxe. Parfait pour l'entrainement quotidien en club. Très confortable et durable dans le temps. Vente cause double emploi.`,
        condition: p.condition,
        price: p.price,
        sellerId: p.sellerId,
        categoryId: p.categoryId,
        status: 'AVAILABLE'
      }
    });

    if (p.attrKey && seededAttributes[p.attrKey]) {
      await prisma.productAttribute.create({
        data: {
          productId: product.id,
          attributeId: seededAttributes[p.attrKey].id
        }
      });
    }

    const imgPath = `/images/${p.imgFolder}/${p.imgName}`;
    await prisma.media.create({
      data: {
        path: imgPath,
        productId: product.id
      }
    });

    newProducts.push(product);
  }
  console.log('5 Produits spécifiques créés pour les nouveaux utilisateurs.');

  // 5. Simulation de Transactions d'Achat (Commandes, Factures, Avis)
  // On va creer 6 commandes completes de produits pour illustrer le systeme de vente
  const orderData = [
    { buyer: john, seller: mike, products: [createdProducts[0], createdProducts[12]] },
    { buyer: mike, seller: john, products: [createdProducts[1], createdProducts[13]] },
    { buyer: createdUsers[3], seller: createdUsers[4], products: [createdProducts[2], createdProducts[14]] },
    { buyer: createdUsers[4], seller: createdUsers[5], products: [createdProducts[3], createdProducts[15]] },
    { buyer: createdUsers[5], seller: createdUsers[6], products: [createdProducts[4], createdProducts[16]] },
    { buyer: createdUsers[6], seller: john, products: [createdProducts[5], createdProducts[17]] },
  ];

  for (let idx = 0; idx < orderData.length; idx++) {
    const data = orderData[idx];
    const buyer = data.buyer;
    const seller = data.seller;
    
    // Calculer total
    const totalAmount = data.products.reduce((sum, p) => sum + p.price, 0);

    // Recuperer adresses
    const shippingAddr = await prisma.address.findFirst({ where: { userId: buyer.id, type: 'SHIPPING' } });
    const billingAddr = await prisma.address.findFirst({ where: { userId: buyer.id, type: 'BILLING' } });

    // Creer commande
    const order = await prisma.order.create({
      data: {
        reference: `2R-${Date.now()}-${idx + 1}`,
        status: 'PAID',
        totalAmount,
        buyerId: buyer.id,
        shippingAddressId: shippingAddr!.id,
        billingAddressId: billingAddr!.id,
      }
    });

    // Archiver les produits et creer OrderItems
    for (const p of data.products) {
      await prisma.product.update({
        where: { id: p.id },
        data: { status: 'ARCHIVED' }
      });

      await prisma.orderItem.create({
        data: {
          quantity: 1,
          unitPriceAtPurchase: p.price,
          orderId: order.id,
          productId: p.id
        }
      });
    }

    // Creer une transaction pour l'acheteur
    const buyerWallet = await prisma.wallet.findUnique({ where: { userId: buyer.id } });
    await prisma.wallet.update({
      where: { id: buyerWallet!.id },
      data: { balance: { decrement: totalAmount } }
    });

    await prisma.transaction.create({
      data: {
        amount: totalAmount,
        type: 'DEBIT',
        description: `Achat commande ${order.reference}`,
        walletId: buyerWallet!.id,
        orderId: order.id,
      }
    });

    // Creer transactions pour le vendeur
    const sellerWallet = await prisma.wallet.findUnique({ where: { userId: seller.id } });
    await prisma.wallet.update({
      where: { id: sellerWallet!.id },
      data: { balance: { increment: totalAmount } }
    });

    await prisma.transaction.create({
      data: {
        amount: totalAmount,
        type: 'CREDIT',
        description: `Vente commande ${order.reference}`,
        walletId: sellerWallet!.id,
        orderId: order.id,
      }
    });

    // Generer facture
    await prisma.facture.create({
      data: {
        reference: `FAC-${Date.now()}-${idx + 1}`,
        client: `${buyer.name} ${buyer.lastname}`,
        path: `/uploads/factures/FAC-${idx + 1}.pdf`,
        orderId: order.id
      }
    });

    // Creer commentaire/avis
    await prisma.review.create({
      data: {
        rating: 4 + (idx % 2),
        comment: idx % 2 === 0 ? 'Vendeur top, colis envoye tres rapidement !' : 'Tres satisfait de mon achat, conforme a la description.',
        orderId: order.id
      }
    });
  }

  console.log('Simulation de commandes, factures, debits/credits et avis terminee.');

  // 6. Simulation de discussions et de messages chat (conversations)
  const chatData = [
    { buyer: john, product: createdProducts[6], messages: [
      { text: "Salut, tes gants m'interessent !", sender: john },
      { text: "Salut John ! Super, ils sont encore dispos.", sender: createdUsers.find(u => u.id === createdProducts[6].sellerId) },
      { text: "Est-ce qu'ils taillent grand ?", sender: john },
      { text: "Non, c'est une taille 14oz tout a fait normale.", sender: createdUsers.find(u => u.id === createdProducts[6].sellerId) },
    ]},
    { buyer: mike, product: createdProducts[7], messages: [
      { text: "Hello Sarah, possible de négocier le prix ?", sender: mike },
      { text: "Salut Mike, je peux te faire 5€ de rabais pas plus.", sender: createdUsers[3] },
      { text: "Ca marche pour moi !", sender: mike },
    ]},
    { buyer: createdUsers[3], product: createdProducts[8], messages: [
      { text: "Bonjour, le casque Venum est toujours dispo ?", sender: createdUsers[3] },
      { text: "Bonjour, oui il est disponible.", sender: createdUsers[4] },
    ]},
  ];

  for (const c of chatData) {
    const sellerId = c.product.sellerId;
    
    // Conversation unique par couple product/buyer
    const conversation = await prisma.conversation.create({
      data: {
        productId: c.product.id,
        buyerId: c.buyer.id
      }
    });

    // Messages
    for (const msg of c.messages) {
      await prisma.message.create({
        data: {
          content: msg.text,
          senderId: msg.sender!.id,
          conversationId: conversation.id,
        }
      });
    }

    // Offers
    await prisma.offer.create({
      data: {
        proposedPrice: c.product.price - 5,
        status: 'PENDING',
        conversationId: conversation.id,
        productId: c.product.id
      }
    });
  }
  console.log('Conversations, messages et offres d\'essai crees.');

  // 7. Favoris
  await prisma.userProduct.createMany({
    data: [
      { userId: john.id, productId: createdProducts[10].id },
      { userId: john.id, productId: createdProducts[11].id },
      { userId: mike.id, productId: createdProducts[18].id },
      { userId: mike.id, productId: createdProducts[19].id },
    ]
  });

  // 8. Creation de quelques signalements
  const typeArnaque = await prisma.typeReport.create({ data: { label: 'Arnaque ou contrefacon' } });
  const typeInapproprie = await prisma.typeReport.create({ data: { label: 'Comportement inapproprie' } });

  await prisma.report.create({
    data: {
      content: 'Ce vendeur vend des contrefacons de Winning.',
      status: 'OPEN',
      userId: mike.id,
      productId: createdProducts[7].id,
      typeReportId: typeArnaque.id
    }
  });

  // 9. Données spécifiques pour les nouveaux utilisateurs (commandes, reviews, favoris, conversations, report)
  // 3 commandes et 2 reviews
  const newOrderData = [
    { buyer: julien, seller: sebastien, product: newProducts[2], reviewRating: 5, reviewComment: "Super vendeur, envoi soigné !" },
    { buyer: sebastien, seller: eliott, product: newProducts[4], reviewRating: 4, reviewComment: "Conforme à la description, merci." },
    { buyer: eliott, seller: julien, product: newProducts[0] }, // Pas de review pour celle-ci (2 reviews au total demandées)
  ];

  for (let idx = 0; idx < newOrderData.length; idx++) {
    const data = newOrderData[idx];
    const buyer = data.buyer;
    const seller = data.seller;
    const product = data.product;

    const shippingAddr = await prisma.address.findFirst({ where: { userId: buyer.id, type: 'SHIPPING' } });
    const billingAddr = await prisma.address.findFirst({ where: { userId: buyer.id, type: 'BILLING' } });

    const order = await prisma.order.create({
      data: {
        reference: `2R-${Date.now()}-NEW-${idx + 1}`,
        status: 'PAID',
        totalAmount: product.price,
        buyerId: buyer.id,
        shippingAddressId: shippingAddr!.id,
        billingAddressId: billingAddr!.id,
      }
    });

    await prisma.product.update({
      where: { id: product.id },
      data: { status: 'ARCHIVED' }
    });

    await prisma.orderItem.create({
      data: {
        quantity: 1,
        unitPriceAtPurchase: product.price,
        orderId: order.id,
        productId: product.id
      }
    });

    const buyerWallet = await prisma.wallet.findUnique({ where: { userId: buyer.id } });
    await prisma.wallet.update({
      where: { id: buyerWallet!.id },
      data: { balance: { decrement: product.price } }
    });

    await prisma.transaction.create({
      data: {
        amount: product.price,
        type: 'DEBIT',
        description: `Achat commande ${order.reference}`,
        walletId: buyerWallet!.id,
        orderId: order.id,
      }
    });

    const sellerWallet = await prisma.wallet.findUnique({ where: { userId: seller.id } });
    await prisma.wallet.update({
      where: { id: sellerWallet!.id },
      data: { balance: { increment: product.price } }
    });

    await prisma.transaction.create({
      data: {
        amount: product.price,
        type: 'CREDIT',
        description: `Vente commande ${order.reference}`,
        walletId: sellerWallet!.id,
        orderId: order.id,
      }
    });

    await prisma.facture.create({
      data: {
        reference: `FAC-${Date.now()}-NEW-${idx + 1}`,
        client: `${buyer.name} ${buyer.lastname}`,
        path: `/uploads/factures/FAC-NEW-${idx + 1}.pdf`,
        orderId: order.id
      }
    });

    if (data.reviewRating) {
      await prisma.review.create({
        data: {
          rating: data.reviewRating,
          comment: data.reviewComment,
          orderId: order.id
        }
      });
    }
  }

  // 5 favoris (uniquement des produits non vendus / AVAILABLE)
  await prisma.userProduct.createMany({
    data: [
      { userId: julien.id, productId: createdProducts[6].id }, // Gants Twins Special Cuir (AVAILABLE)
      { userId: julien.id, productId: createdProducts[8].id }, // Gants Leone 1947 Shock (AVAILABLE)
      { userId: sebastien.id, productId: createdProducts[9].id }, // Gants de combat Ringhorns (AVAILABLE)
      { userId: sebastien.id, productId: newProducts[1].id }, // Casque Protect Julien (AVAILABLE)
      { userId: eliott.id, productId: newProducts[3].id }, // Short Venum Sebastien (AVAILABLE)
    ]
  });

  // Conversations, messages et offres avec d'autres utilisateurs
  const convJulienMike = await prisma.conversation.create({
    data: {
      productId: createdProducts[10].id,
      buyerId: julien.id
    }
  });
  await prisma.message.createMany({
    data: [
      { content: "Salut Mike, ton équipement m'intéresse beaucoup !", senderId: julien.id, conversationId: convJulienMike.id },
      { content: "Salut Julien, pas de soucis, il est en très bon état.", senderId: mike.id, conversationId: convJulienMike.id },
    ]
  });
  await prisma.offer.create({
    data: {
      proposedPrice: createdProducts[10].price - 10,
      status: 'PENDING',
      conversationId: convJulienMike.id,
      productId: createdProducts[10].id
    }
  });

  const convSebJohn = await prisma.conversation.create({
    data: {
      productId: createdProducts[11].id,
      buyerId: sebastien.id
    }
  });
  await prisma.message.createMany({
    data: [
      { content: "Bonjour John, une baisse de prix est possible ?", senderId: sebastien.id, conversationId: convSebJohn.id },
      { content: "Bonjour, oui propose un prix et on verra !", senderId: john.id, conversationId: convSebJohn.id },
    ]
  });
  await prisma.offer.create({
    data: {
      proposedPrice: createdProducts[11].price - 5,
      status: 'PENDING',
      conversationId: convSebJohn.id,
      productId: createdProducts[11].id
    }
  });

  const convEliottJulien = await prisma.conversation.create({
    data: {
      productId: newProducts[1].id,
      buyerId: eliott.id
    }
  });
  await prisma.message.createMany({
    data: [
      { content: "Salut Julien, ton casque m'intéresse.", senderId: eliott.id, conversationId: convEliottJulien.id },
      { content: "Salut Eliott, nickel, dis-moi si tu veux le prendre.", senderId: julien.id, conversationId: convEliottJulien.id },
    ]
  });

  // 1 report
  await prisma.report.create({
    data: {
      content: 'Le titre ne correspond pas aux photos.',
      status: 'OPEN',
      userId: eliott.id,
      productId: newProducts[2].id,
      typeReportId: typeArnaque.id
    }
  });

  console.log('Signalements et favoris initialises.');
  console.log('==============================================');
  console.log('Seed enrichie terminee avec succes !');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());