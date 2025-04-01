import { Test, TestingModule } from '@nestjs/testing';
import { DatabasetypeService } from './databasetype.service';

describe('DatabasetypeService', () => {
  let service: DatabasetypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabasetypeService],
    }).compile();

    service = module.get<DatabasetypeService>(DatabasetypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
