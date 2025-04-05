import { Test, TestingModule } from '@nestjs/testing';
import { SchemaTableService } from './schema_table.service';

describe('SchemaTableService', () => {
  let service: SchemaTableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchemaTableService],
    }).compile();

    service = module.get<SchemaTableService>(SchemaTableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
