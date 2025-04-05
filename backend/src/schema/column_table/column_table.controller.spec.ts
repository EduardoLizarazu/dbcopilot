import { Test, TestingModule } from '@nestjs/testing';
import { ColumnTableController } from './column_table.controller';
import { ColumnTableService } from './column_table.service';

describe('ColumnTableController', () => {
  let controller: ColumnTableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColumnTableController],
      providers: [ColumnTableService],
    }).compile();

    controller = module.get<ColumnTableController>(ColumnTableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
