import { Test, TestingModule } from '@nestjs/testing';
import { SchemaColumnService } from './schema_column.service';

describe('SchemaColumnService', () => {
  let service: SchemaColumnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchemaColumnService],
    }).compile();

    service = module.get<SchemaColumnService>(SchemaColumnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
