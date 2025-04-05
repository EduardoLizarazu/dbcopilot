import { Test, TestingModule } from '@nestjs/testing';
import { ColumnTableService } from './column_table.service';

describe('ColumnTableService', () => {
  let service: ColumnTableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ColumnTableService],
    }).compile();

    service = module.get<ColumnTableService>(ColumnTableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
