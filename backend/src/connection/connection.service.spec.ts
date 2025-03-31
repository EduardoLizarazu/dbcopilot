import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionService } from './connection.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection } from './entities/connection.entity';

// Mock repository
const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ConnectionService', () => {
  let service: ConnectionService;
  let repository: jest.Mocked<Repository<Connection>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionService,
        {
          provide: getRepositoryToken(Connection),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ConnectionService>(ConnectionService);
    repository = module.get(getRepositoryToken(Connection));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new connection', async () => {
      const dto = { name: 'Test Connection' };
      const connectionEntity = { 
        id: 1, 
        ...dto, 
        dbType: 'PostgreSQL', 
        dbName: 'test_db', 
        dbHost: 'localhost', 
        dbPort: 5432, 
        dbUsername: 'user', 
        dbPassword: 'password' 
      };

      repository.create.mockReturnValue(connectionEntity as any);
      repository.save.mockResolvedValue(connectionEntity);

      const result = await service.create(dto as any);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(connectionEntity);
      expect(result).toEqual(connectionEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of connections', async () => {
      const connections = [
        {
          id: 1,
          name: 'Test Connection',
          dbType: 'PostgreSQL',
          dbName: 'test_db',
          dbHost: 'localhost',
          dbPort: 5432,
          dbUsername: 'user',
          dbPassword: 'password',
        },
      ];
      repository.find.mockResolvedValue(connections);

      const result = await service.findAll();
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(connections);
    });
  });

  describe('findOne', () => {
    it('should return a single connection by id', async () => {
      const connection = { 
        id: 1, 
        name: 'Test Connection', 
        dbType: 'PostgreSQL', 
        dbName: 'test_db', 
        dbHost: 'localhost', 
        dbPort: 5432, 
        dbUsername: 'user', 
        dbPassword: 'password' 
      };
      repository.findOneBy.mockResolvedValue(connection as Connection);

      const result = await service.findOne(1);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(connection);
    });

    it('should throw an error if connection is not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        'Failed to fetch connection',
      );
    });
  });

  describe('update', () => {
    it('should update a connection', async () => {
      const updateDto = { name: 'Updated Connection' };
      repository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.update(1, updateDto as any);
      expect(repository.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('remove', () => {
    it('should delete a connection', async () => {
      repository.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.remove(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ affected: 1 });
    });
  });
});