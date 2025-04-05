import { Test, TestingModule } from '@nestjs/testing';
import { SchemaTableController } from './schema_table.controller';
import { SchemaTableService } from './schema_table.service';

describe('SchemaTableController', () => {
  let controller: SchemaTableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchemaTableController],
      providers: [SchemaTableService],
    }).compile();

    controller = module.get<SchemaTableController>(SchemaTableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
