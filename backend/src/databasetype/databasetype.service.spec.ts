import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DatabasetypeService } from './databasetype.service';
import { Databasetype } from './entities/databasetype.entity';
import { CreateDatabasetypeDto } from './dto/create-databasetype.dto';
import { UpdateDatabasetypeDto } from './dto/update-databasetype.dto';

describe('DatabasetypeService', () => {
  let service: DatabasetypeService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabasetypeService,
        {
          provide: getRepositoryToken(Databasetype),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DatabasetypeService>(DatabasetypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a databasetype', async () => {
      const dto: CreateDatabasetypeDto = {
        name: 'Test DB',
        type: 'test',
        query: 'SELECT 1',
      };
      const expectedResult = { id: 1, ...dto };
      
      mockRepository.create.mockReturnValue(expectedResult);
      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.create(dto);
      expect(result).toEqual(expectedResult);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedResult);
    });

    it('should throw an error when creation fails', async () => {
      const dto: CreateDatabasetypeDto = {
        name: 'Test DB',
        type: 'test',
        query: 'SELECT 1',
      };
      
      mockRepository.create.mockImplementation(() => {
        throw new Error('DB Error');
      });

      await expect(service.create(dto)).rejects.toThrow('Failed to create databasetype');
    });
  });

  describe('findAll', () => {
    it('should return an array of databasetypes', async () => {
      const expectedResult = [{ id: 1, name: 'Test DB', type: 'test', query: 'SELECT 1' }];
      mockRepository.find.mockResolvedValue(expectedResult);

      const result = await service.findAll();
      expect(result).toEqual(expectedResult);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should throw an error when retrieval fails', async () => {
      mockRepository.find.mockRejectedValue(new Error('DB Error'));
      await expect(service.findAll()).rejects.toThrow('Failed to fetch databasetypes');
    });
  });

  describe('findOneById', () => {
    it('should return a single databasetype by ID', async () => {
      const expectedResult = { id: 1, name: 'Test DB', type: 'test', query: 'SELECT 1' };
      mockRepository.findOneBy.mockResolvedValue(expectedResult);

      const result = await service.findOneById(1);
      expect(result).toEqual(expectedResult);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return null if databasetype is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      const result = await service.findOneById(999);
      expect(result).toBeNull();
    });

    it('should throw an error when retrieval by ID fails', async () => {
      mockRepository.findOneBy.mockRejectedValue(new Error('DB Error'));
      await expect(service.findOneById(1)).rejects.toThrow('Failed to fetch databasetype');
    });
  });

  describe('findOneByType', () => {
    it('should return a databasetype by type', async () => {
      const expectedResult = { id: 1, name: 'Test DB', type: 'test', query: 'SELECT 1' };
      mockRepository.findOneBy.mockResolvedValue(expectedResult);

      const result = await service.findOneByType('test');
      expect(result).toEqual(expectedResult);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ type: 'test' });
    });

    it('should throw an error if databasetype is not found by type', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findOneByType('unknown')).rejects.toThrow('Databasetype not found');
    });

    it('should throw an error when retrieval by type fails', async () => {
      mockRepository.findOneBy.mockRejectedValue(new Error('DB Error'));
      await expect(service.findOneByType('test')).rejects.toThrow('Failed to fetch databasetype');
    });
  });

  describe('update', () => {
    it('should update a databasetype', async () => {
      const dto: UpdateDatabasetypeDto = { name: 'Updated DB' };
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await expect(service.update(1, dto)).resolves.toBeDefined();
      expect(mockRepository.update).toHaveBeenCalledWith(1, dto);
    });

    it('should throw an error when update fails', async () => {
      const dto: UpdateDatabasetypeDto = { name: 'Updated DB' };
      mockRepository.update.mockRejectedValue(new Error('DB Error'));
      await expect(service.update(1, dto)).rejects.toThrow('Failed to update databasetype');
    });
  });

  describe('remove', () => {
    it('should delete a databasetype', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove(1)).resolves.toBeDefined();
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw an error when deletion fails', async () => {
      mockRepository.delete.mockRejectedValue(new Error('DB Error'));
      await expect(service.remove(1)).rejects.toThrow('Failed to delete databasetype');
    });
  });
});