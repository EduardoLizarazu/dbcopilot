import { Test, TestingModule } from '@nestjs/testing';
import { SchemaColumnController } from './schema_column.controller';
import { SchemaColumnService } from './schema_column.service';

describe('SchemaColumnController', () => {
  let controller: SchemaColumnController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchemaColumnController],
      providers: [SchemaColumnService],
    }).compile();

    controller = module.get<SchemaColumnController>(SchemaColumnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
