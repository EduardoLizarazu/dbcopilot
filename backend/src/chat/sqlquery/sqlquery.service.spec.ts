import { Test, TestingModule } from '@nestjs/testing';
import { SqlqueryService } from './sqlquery.service';

describe('SqlqueryService', () => {
  let service: SqlqueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SqlqueryService],
    }).compile();

    service = module.get<SqlqueryService>(SqlqueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
