import { Injectable } from '@nestjs/common';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';
import { Connection } from './entities/connection.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
  ) {}
  async create(createConnectionDto: CreateConnectionDto) {
    try {
      if((await this.testConnection(createConnectionDto)) === false) 
        throw new Error('Connection test failed: Invalid database credentials or connection details.');
      const connection = this.connectionRepository.create(createConnectionDto);
      return await this.connectionRepository.save(connection);
    } catch (error) {
      console.error('Error creating connection:', error);
      throw new Error('Failed to create connection');
    }
  }

  async findAll() {
    try {
      return await this.connectionRepository.find();
    } catch (error) {
      console.error('Error fetching connections:', error);
      throw new Error('Failed to fetch connections');
    }
  }

  async findOne(id: number) {
    try {
      return await this.connectionRepository.findOneBy({ id });
    } catch (error) {
      console.error('Error fetching connection:', error);
      throw new Error('Failed to fetch connection');
    }
  }

  async update(id: number, updateConnectionDto: UpdateConnectionDto) {
    try {
      return await this.connectionRepository.update(id, updateConnectionDto);
    } catch (error) {
      console.error('Error updating connection:', error);
      throw new Error('Failed to update connection');
      
    }
  }

  async remove(id: number) {
    try {
      return await this.connectionRepository.delete(id);
    } catch (error) {
      console.error('Error deleting connection:', error);
      throw new Error('Failed to delete connection');
    }
  }

  async testConnection(connection: Partial<CreateConnectionDto>): Promise<boolean> {
    const { dbType, dbHost, dbPort, dbUsername, dbPassword, dbName } = connection;

    try {
      // Create a temporary DataSource configuration
      const dataSource = new DataSource({
        type: dbType as any, // Cast to TypeORM's DatabaseType
        host: dbHost,
        port: dbPort,
        username: dbUsername,
        password: dbPassword,
        database: dbName,
        synchronize: false,
        logging: false,
      });

      // Initialize and check connection
      await dataSource.initialize();

      // Select schema base on database type

      await dataSource.destroy(); // Close connection after test
      
      return true;
    } catch (error) {
      console.error('Connection test failed:', error.message);
      return false;
    }
  }
}