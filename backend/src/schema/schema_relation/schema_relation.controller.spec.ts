import { Test, TestingModule } from '@nestjs/testing';
import { SchemaRelationController } from './schema_relation.controller';
import { SchemaRelationService } from './schema_relation.service';

describe('SchemaRelationController', () => {
  let controller: SchemaRelationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchemaRelationController],
      providers: [SchemaRelationService],
    }).compile();

    controller = module.get<SchemaRelationController>(SchemaRelationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
