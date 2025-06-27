import { Test, TestingModule } from '@nestjs/testing';
import { SchemaGraphController } from './schema-graph.controller';
import { SchemaGraphService } from './schema-graph.service';

describe('SchemaGraphController', () => {
  let controller: SchemaGraphController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchemaGraphController],
      providers: [SchemaGraphService],
    }).compile();

    controller = module.get<SchemaGraphController>(SchemaGraphController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
