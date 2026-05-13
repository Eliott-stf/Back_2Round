import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TypeReportsService } from './type-reports.service';
import { CreateTypeReportDto } from './dto/create-type-report.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { Role } from '../generated/prisma/enums';


@Controller('type-reports')
export class TypeReportsController {
  constructor(private readonly typeReportService: TypeReportsService) {}
 
  /**
   * GET /type-reports
   * Liste tous les types de signalement
   * @Auth Utilisateur authentifié
   */
  @Get()
  @Auth()
  findAll() {
    return this.typeReportService.findAllTypeReports();
  }
 
  /**
   * POST /type-reports
   * Crée un type de signalement
   * @Auth Admin
   */

  @Post()
  @Auth(Role.ADMIN)
  create(@Body() dto: CreateTypeReportDto) {
    return this.typeReportService.createTypeReport(dto);
  }
 
  /**
   * DELETE /type-reports/:id
   * Supprime un type de signalement
   * @Auth Admin
   */
  @Delete(':id')
  @Auth(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.typeReportService.deleteTypeReport(id);
  }
}
