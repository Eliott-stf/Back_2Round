import { Test, TestingModule } from '@nestjs/testing';
import { TypeReportsController } from './type-reports.controller';
import { TypeReportsService } from './type-reports.service';

describe('TypeReportsController', () => {
  let controller: TypeReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeReportsController],
      providers: [TypeReportsService],
    }).compile();

    controller = module.get<TypeReportsController>(TypeReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
