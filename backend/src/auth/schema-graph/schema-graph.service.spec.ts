import { Test, TestingModule } from '@nestjs/testing';
import { SchemaGraphService } from './schema-graph.service';

describe('SchemaGraphService', () => {
  let service: SchemaGraphService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchemaGraphService],
    }).compile();

    service = module.get<SchemaGraphService>(SchemaGraphService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
