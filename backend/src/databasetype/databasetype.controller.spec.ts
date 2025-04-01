import { Test, TestingModule } from '@nestjs/testing';
import { DatabasetypeController } from './databasetype.controller';
import { DatabasetypeService } from './databasetype.service';

describe('DatabasetypeController', () => {
  let controller: DatabasetypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatabasetypeController],
      providers: [DatabasetypeService],
    }).compile();

    controller = module.get<DatabasetypeController>(DatabasetypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
