import { Controller, Get, Post, Param, Res, StreamableFile } from '@nestjs/common';
import { FacturesService } from './factures.service';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Response } from 'express';

@Controller('factures')
export class FacturesController {
  constructor(private readonly facturesService: FacturesService) {}

  /**
   * POST /factures/:orderId/generate
   * Génère manuellement et sauvegarde la facture pour une commande
   */
  @Post(':orderId/generate')
  @Auth()
  async generate(
    @Param('orderId') orderId: string,
    @CurrentUser() user: any,
  ) {
    return this.facturesService.generate(orderId, user.id, user.role);
  }

  /**
   * GET /factures/:orderId
   * Récupère les métadonnées de la facture liée à une commande
   */
  @Get(':orderId')
  @Auth()
  async getInvoiceInfo(
    @Param('orderId') orderId: string,
    @CurrentUser() user: any,
  ) {
    return this.facturesService.findByOrder(orderId, user.id, user.role);
  }

  /**
   * GET /factures/:factureId/download
   * Télécharge la facture PDF correspondante
   */
  @Get(':factureId/download')
  @Auth()
  async download(
    @Param('factureId') factureId: string,
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, reference } = await this.facturesService.download(
      factureId,
      user.id,
      user.role,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${reference}.pdf"`,
    });

    return new StreamableFile(stream);
  }
}
