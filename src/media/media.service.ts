import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService {

  constructor(private readonly prisma: PrismaService) { }

  // Upload images pour un produit
  async uploadProductImages(userId: string, productId: string, files: Express.Multer.File[]) {
    // Vérifier que le produit appartient à l'user
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    //Vérifs
    if (!product) throw new NotFoundException('Produit introuvable');
    if (product.sellerId !== userId) throw new ForbiddenException('Ce produit ne vous appartient pas');

    // Créer les entrées en DB
    const medias = await Promise.all(
      files.map(file =>
        this.prisma.media.create({
          data: {
            path: `/uploads/products/${file.filename}`,
            productId,
          },
        })
      )
    );

    return medias;
  }

  // Supprimer une image
  async remove(userId: string, mediaId: string) {
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
      include: { product: true },
    });

    if (!media) throw new NotFoundException('Media introuvable');
    if (media.product.sellerId !== userId) throw new ForbiddenException('Accès refusé');

    // Supprimer le fichier du disque
    const filePath = path.join(process.cwd(), 'public', media.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.prisma.media.delete({ where: { id: mediaId } });
    return { message: 'Image supprimée' };
  }

}