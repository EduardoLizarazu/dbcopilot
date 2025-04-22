import { Test, TestingModule } from '@nestjs/testing';
import { SqlqueryController } from './sqlquery.controller';
import { SqlqueryService } from './sqlquery.service';

describe('SqlqueryController', () => {
  let controller: SqlqueryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SqlqueryController],
      providers: [SqlqueryService],
    }).compile();

    controller = module.get<SqlqueryController>(SqlqueryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
