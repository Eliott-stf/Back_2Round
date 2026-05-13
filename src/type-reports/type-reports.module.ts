import { Module } from '@nestjs/common';
import { TypeReportsService } from './type-reports.service';
import { TypeReportsController } from './type-reports.controller';

@Module({
  controllers: [TypeReportsController],
  providers: [TypeReportsService],
})
export class TypeReportsModule {}
