import { Test, TestingModule } from '@nestjs/testing';
import { TypeReportsService } from './type-reports.service';

describe('TypeReportsService', () => {
  let service: TypeReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeReportsService],
    }).compile();

    service = module.get<TypeReportsService>(TypeReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
