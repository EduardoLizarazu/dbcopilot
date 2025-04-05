import { Test, TestingModule } from '@nestjs/testing';
import { SchemaRelationService } from './schema_relation.service';

describe('SchemaRelationService', () => {
  let service: SchemaRelationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchemaRelationService],
    }).compile();

    service = module.get<SchemaRelationService>(SchemaRelationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
