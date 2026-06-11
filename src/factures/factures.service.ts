import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FacturesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Génère une facture PDF pour une commande donnée
   * @param orderId ID de la commande
   * @param userId (Optionnel) ID de l'utilisateur effectuant la demande (si appelé via controller)
   * @param userRole (Optionnel) Rôle de l'utilisateur (si appelé via controller)
   * @param type (Optionnel) Type de facture (INVOICE ou REFUND)
   */
  async generate(orderId: string, userId?: string, userRole?: string, type: 'INVOICE' | 'REFUND' = 'INVOICE') {
    // 1. Récupération de la commande avec ses relations
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        billingAddress: true,
        shippingAddress: true,
        items: {
          include: {
            product: {
              include: {
                seller: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Commande ${orderId} introuvable`);
    }

    // 2. Vérification des droits si appelé via HTTP Controller
    if (userId && userRole) {
      const isBuyer = order.buyerId === userId;
      const isAdmin = userRole === 'ADMIN' || userRole === 'MODO';
      if (!isBuyer && !isAdmin) {
        throw new ForbiddenException('Accès refusé pour générer cette facture');
      }
    }

    // Vérifier le statut
    if (type === 'INVOICE' && order.status !== 'PAID' && order.status !== 'SHIPPED' && order.status !== 'DELIVERED') {
      throw new BadRequestException(`Impossible de générer une facture pour une commande au statut : ${order.status}`);
    }
    if (type === 'REFUND' && order.status !== 'CANCELLED' && order.status !== 'REFUNDED') {
      throw new BadRequestException(`Impossible de générer une facture d'annulation pour une commande au statut : ${order.status}`);
    }

    // 3. Préparer le dossier de stockage
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'factures');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const reference = type === 'REFUND' ? `REF-${order.reference.replace('2R-', '')}` : `FAC-${order.reference.replace('2R-', '')}`;
    const filename = `${reference}.pdf`;
    const filePath = path.join(uploadDir, filename);
    const dbPath = `/uploads/factures/${filename}`;

    // 4. Générer le fichier PDF
    await this.generatePdfFile(order, reference, filePath, type);

    // 5. Enregistrer l'entrée Facture en BDD
    const clientName = `${order.buyer.name} ${order.buyer.lastname}`;
    
    // Si la facture existe déjà (génération manuelle par la suite), on met juste à jour ou on la renvoie
    const existingFacture = await this.prisma.facture.findUnique({
      where: { orderId_type: { orderId: order.id, type } },
    });

    if (existingFacture) {
      return existingFacture;
    }

    const facture = await this.prisma.facture.create({
      data: {
        reference,
        client: clientName,
        path: dbPath,
        orderId: order.id,
        type,
      },
    });

    return facture;
  }

  /**
   * Récupère les informations d'une facture par l'ID de sa commande
   */
  async findByOrder(orderId: string, userId: string, userRole: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Commande ${orderId} introuvable`);
    }

    // Vérification des droits : acheteur, vendeur, ou admin/modo
    const isBuyer = order.buyerId === userId;
    const isSeller = order.items.some((item) => item.product.sellerId === userId);
    const isAdmin = userRole === 'ADMIN' || userRole === 'MODO';

    if (!isBuyer && !isSeller && !isAdmin) {
      throw new ForbiddenException('Accès refusé');
    }

    // Retourne toutes les factures de cette commande
    const factures = await this.prisma.facture.findMany({
      where: { orderId },
    });

    if (!factures || factures.length === 0) {
      throw new NotFoundException(`Facture pour la commande ${orderId} introuvable`);
    }

    return factures;
  }

  /**
   * Récupère le stream de téléchargement de la facture PDF
   */
  async download(factureId: string, userId: string, userRole: string) {
    const facture = await this.prisma.facture.findUnique({
      where: { id: factureId },
      include: {
        order: {
          include: {
            buyer: true,
            billingAddress: true,
            shippingAddress: true,
            items: {
              include: {
                product: {
                  include: {
                    seller: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!facture) {
      throw new NotFoundException(`Facture ${factureId} introuvable`);
    }

    // Vérification des droits : acheteur, vendeur, ou admin/modo
    const isBuyer = facture.order.buyerId === userId;
    const isSeller = facture.order.items.some((item) => item.product.sellerId === userId);
    const isAdmin = userRole === 'ADMIN' || userRole === 'MODO';

    if (!isBuyer && !isSeller && !isAdmin) {
      throw new ForbiddenException('Accès refusé');
    }

    const filePath = path.join(process.cwd(), 'public', facture.path);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Fichier PDF introuvable sur le serveur');
    }

    return {
      stream: fs.createReadStream(filePath),
      reference: facture.reference,
    };
  }

  /**
   * Génération du document PDF avec PDFKit
   */
  private async generatePdfFile(order: any, reference: string, filePath: string, type: 'INVOICE' | 'REFUND' = 'INVOICE'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Palette de couleurs 2Round
        const primaryColor = '#1B1716';   // Charcoal sombre
        const accentColor = '#630102';    // Rouge profond
        const secondaryColor = '#4A5568'; // Gris moyen
        const borderColor = '#E2E8F0';     // Gris très clair
        const bgColor = '#F7FAFC';         // Fond alternatif

        // Logo image 2ROUND avec arrière-plan noir/charbon et fallback texte
        const logoPath = path.join(process.cwd(), 'public', 'images', '2ROUND.png');
        if (fs.existsSync(logoPath)) {
          // Dessiner le fond noir/charbon (34px de hauteur pour épouser l'image)
          doc.rect(45, 38, 130, 44)
             .fill('#1B1716');
          doc.image(logoPath, 50, 45, { width: 120 });
        } else {
          doc.fillColor(accentColor)
             .fontSize(28)
             .font('Helvetica-Bold')
             .text('2', 50, 50, { continued: true })
             .fillColor(primaryColor)
             .text('ROUND');
        }

        // Métadonnées Facture
        const factureTitle = type === 'REFUND' ? "FACTURE D'ANNULATION" : "FACTURE";
        doc.fillColor(primaryColor)
           .fontSize(18)
           .font('Helvetica-Bold')
           .text(factureTitle, 350, 50, { align: 'right', width: 200 });

        doc.fillColor(secondaryColor)
           .fontSize(9)
           .font('Helvetica')
           .text(`Référence : ${reference}`, 400, 75, { align: 'right' })
           .text(`Date : ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`, 400, 90, { align: 'right' })
           .text(`Commande : ${order.reference}`, 400, 105, { align: 'right' });

        // Séparateur horizontal
        doc.moveTo(50, 130)
           .lineTo(545, 130)
           .strokeColor(borderColor)
           .lineWidth(1)
           .stroke();

        // --- ADRESSES ÉMETTEUR, FACTURATION & LIVRAISON (3 COLONNES) ---
        doc.fillColor(primaryColor)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('Émetteur :', 50, 150)
           .text('Facturé à :', 215, 150)
           .text('Livré à :', 380, 150);

        doc.fillColor(secondaryColor)
           .fontSize(8.5)
           .font('Helvetica')
           .text('2ROUND Marketplace', 50, 168, { width: 150 })
           .text('Paris, France', 50, 180, { width: 150 })
           .text('support@2round.com', 50, 192, { width: 150 });

        const buyer = order.buyer;

        // Adresse de Facturation
        const billing = order.billingAddress;
        const billingText = billing 
          ? `${billing.streetNumber || ''} ${billing.streetName}\n${billing.zipCode} ${billing.city}${billing.additionalInfo ? `\n${billing.additionalInfo}` : ''}`
          : 'Aucune adresse renseignée';

        doc.fillColor(secondaryColor)
           .fontSize(8.5)
           .font('Helvetica')
           .text(`${buyer.name} ${buyer.lastname}`, 215, 168, { width: 150 })
           .text(buyer.email, 215, 180, { width: 150 })
           .text(billingText, 215, 192, { width: 150 });

        // Adresse de Livraison
        const shipping = order.shippingAddress;
        const shippingText = shipping 
          ? `${shipping.streetNumber || ''} ${shipping.streetName}\n${shipping.zipCode} ${shipping.city}${shipping.additionalInfo ? `\n${shipping.additionalInfo}` : ''}`
          : 'Aucune adresse renseignée';

        doc.fillColor(secondaryColor)
           .fontSize(8.5)
           .font('Helvetica')
           .text(`${buyer.name} ${buyer.lastname}`, 380, 168, { width: 150 })
           .text(shippingText, 380, 180, { width: 150 });

        const tableTop = 270;

        // --- EN-TÊTE DU TABLEAU ---
        doc.rect(50, tableTop, 495, 25)
           .fill(bgColor);

        doc.fillColor(primaryColor)
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('Description de l\'article', 60, tableTop + 8)
           .text('Taille', 260, tableTop + 8, { width: 60, align: 'center' })
           .text('Prix Unit.', 330, tableTop + 8, { width: 80, align: 'right' })
           .text('Qté', 420, tableTop + 8, { width: 40, align: 'center' })
           .text('Total', 470, tableTop + 8, { width: 65, align: 'right' });

        // Ligne sous l'en-tête du tableau
        doc.moveTo(50, tableTop + 25)
           .lineTo(545, tableTop + 25)
           .strokeColor(borderColor)
           .lineWidth(1)
           .stroke();

        // --- LIGNES D'ARTICLES (AVEC VENDEUR) ---
        let currentY = tableTop + 25;
        const rowHeight = 40; // Hauteur ajustée pour le sous-titre vendeur

        order.items.forEach((item: any, index: number) => {
          const product = item.product;
          const totalItemPrice = item.unitPriceAtPurchase * item.quantity;

          // Arrière-plan alterné
          if (index % 2 === 1) {
            doc.rect(50, currentY, 495, rowHeight)
               .fill('#F9FAFB');
          }

          const sellerName = product.seller 
            ? `Vendeur : ${product.seller.name} ${product.seller.lastname}`
            : 'Vendeur : -';

          doc.fillColor(primaryColor)
             .fontSize(9)
             .font('Helvetica-Bold')
             .text(product.title, 60, currentY + 8, { width: 190, ellipsis: true });
          
          doc.fillColor(secondaryColor)
             .fontSize(7.5)
             .font('Helvetica')
             .text(sellerName, 60, currentY + 22, { width: 190, ellipsis: true });

          doc.fillColor(primaryColor)
             .fontSize(9)
             .font('Helvetica')
             .text(product.size || '-', 260, currentY + 15, { width: 60, align: 'center' })
             .text(`${item.unitPriceAtPurchase.toFixed(2)} €`, 330, currentY + 15, { width: 80, align: 'right' })
             .text(item.quantity.toString(), 420, currentY + 15, { width: 40, align: 'center' })
             .text(`${totalItemPrice.toFixed(2)} €`, 470, currentY + 15, { width: 65, align: 'right' });

          currentY += rowHeight;

          // Ligne séparatrice d'article
          doc.moveTo(50, currentY)
             .lineTo(545, currentY)
             .strokeColor(borderColor)
             .lineWidth(0.5)
             .stroke();
        });

        // --- SECTION TOTAL & RÈGLEMENT ---
        const totalY = currentY + 20;
        const isRefund = type === 'REFUND';
        const sign = isRefund ? '-' : '';

        // Informations de paiement (Aquittée) à gauche
        const paymentDate = new Date(order.updatedAt).toLocaleDateString('fr-FR');
        doc.fillColor(primaryColor)
           .fontSize(9)
           .font('Helvetica-Bold')
           .text(isRefund ? 'Remboursement :' : 'Règlement :', 50, totalY);

        doc.fillColor(secondaryColor)
           .fontSize(8)
           .font('Helvetica')
           .text(isRefund ? `Statut : Remboursée` : `Statut : Facture acquittée`, 50, totalY + 14)
           .text(`Mode : Portefeuille 2ROUND`, 50, totalY + 24)
           .text(`Date : ${paymentDate}`, 50, totalY + 34);

        // Totaux à droite
        doc.fillColor(primaryColor)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('Sous-total', 380, totalY, { width: 80, align: 'right' })
           .text(`${sign}${order.totalAmount.toFixed(2)} €`, 470, totalY, { width: 65, align: 'right' });

        doc.fillColor(primaryColor)
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('Total Général', 380, totalY + 22, { width: 80, align: 'right' })
           .fillColor(accentColor)
           .text(`${sign}${order.totalAmount.toFixed(2)} €`, 470, totalY + 22, { width: 65, align: 'right' });

        // --- PIED DE PAGE ---
        doc.fillColor(secondaryColor)
           .fontSize(9)
           .font('Helvetica-Oblique')
           .text('Merci pour votre confiance et bon entraînement !', 50, 690, { align: 'center' });

        doc.fillColor('#A0AEC0')
           .fontSize(7.5)
           .font('Helvetica')
           .text('2ROUND SAS - Siret 123 456 789 00012 - TVA non applicable, art. 293 B du CGI', 50, 715, { align: 'center' })
           .text('Plateforme de mise en relation pour équipements de boxe d\'occasion.', 50, 725, { align: 'center' });

        doc.end();

        stream.on('finish', () => resolve());
        stream.on('error', (err) => reject(err));
      } catch (error) {
        reject(error);
      }
    });
  }
}
