import { Controller, Post, Body, Get, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { Role } from '../generated/prisma/enums';
import { ReportsService } from './reports.service';


@Controller('reports')
export class ReportsController {

  constructor(private readonly reportService: ReportsService) { }

  /**
   * POST /reports
   * Crée un signalement
   * @Auth Utilisateur authentifié
   */
  @Post()
  @Auth()
  create(@Request() req, @Body() createReportDto: CreateReportDto) {
    return this.reportService.create(req.user.id, createReportDto);
  }

  /**
   * GET /reports/mine
   * Liste les signalements de l'utilisateur connecté
   * @Auth Utilisateur authentifié
   */
  @Get('mine')
  @Auth()
  findMine(@Request() req) {
    return this.reportService.findMine(req.user.id);
  }

  /**
   * GET /reports
   * Liste tous les signalements
   * @Auth Utilisateur authentifié (ADMIN)
   */
  @Get()
  @Auth(Role.ADMIN)
  findAll() {
    return this.reportService.findAll();
  }

  /**
   * GET /reports/:id
   * Récupère le détail d'un signalement
   * @Auth Utilisateur authentifié (ADMIN)
   */
  @Get(':id')
  @Auth(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(id);
  }

  /**
   * PATCH /reports/:id/resolve
   * Marque un signalement comme résolu
   * @Auth Utilisateur authentifié (ADMIN)
   */
  @Patch(':id/resolve')
  @Auth(Role.ADMIN)
  resolve(@Request() req, @Param('id') id: string) {
    return this.reportService.resolve(req.user.id, id);
  }
}