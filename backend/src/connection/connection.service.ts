import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';
import { Connection } from './entities/connection.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConnectionCreate,
  ValidateConnectionCreate,
} from './interface/connection-create.interface';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
  ) {}
  async create(createConnectionDto: CreateConnectionDto) {
    try {
      // Create with the databasetype relation
      const connection = this.connectionRepository.create({
        ...createConnectionDto,
        databasetype: { id: createConnectionDto.dbTypeId },
      });
      const connectionSaved = await this.connectionRepository.save(connection);
      return connectionSaved;
    } catch (error) {
      console.error('Error creating connection:', error);
      throw new Error('Failed to create connection');
    }
  }

  async findAll() {
    try {
      // find with the name of the database type and only select the type
      const conn = await this.connectionRepository.find({
        relations: ['databasetype'],
        select: {
          id: true,
          name: true,
          description: true,
          dbName: true,
          dbHost: true,
          dbPort: true,
          dbUsername: true,
          dbPassword: false,
          is_connected: true,
          databasetype: {
            id: true,
            type: true,
          },
        },
      });

      // test the connection and update the is_connected field
      const connUpdated = conn.map(async (c) =>
        this.testConnectionByIdConnection(c.id),
      );
      return connUpdated;
    } catch (error) {
      console.error('Error fetching connections:', error);
      throw new Error('Failed to fetch connections');
    }
  }

  async findOne(id: number) {
    try {
      return await this.connectionRepository.findOne({
        where: { id: id },
        relations: ['databasetype'],
        select: {
          id: true,
          name: true,
          description: true,
          dbName: true,
          dbHost: true,
          dbPort: true,
          dbUsername: true,
          dbPassword: true,
          is_connected: true,
          databasetype: {
            id: true,
            type: true,
          },
        },
      });
    } catch (error) {
      console.error('Error fetching connection:', error);
      throw new Error('Failed to fetch connection');
    }
  }

  async update(id: number, updateConnectionDto: UpdateConnectionDto) {
    try {
      const update: ConnectionCreate =
        ValidateConnectionCreate(updateConnectionDto);
      return await this.connectionRepository.update(id, update);
    } catch (error) {
      console.error('Error updating connection:', error);
      throw new Error('Failed to update connection');
    }
  }

  async updateConnectionStatus(id: number, status: boolean) {
    try {
      return await this.connectionRepository.update(id, {
        is_connected: status,
      });
    } catch (error) {
      console.error('Error updating connection status:', error);
      throw new Error('Failed to update connection status');
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

  async testConnection(connection: CreateConnectionDto): Promise<HttpStatus> {
    const { dbTypeId, dbHost, dbPort, dbUsername, dbPassword, dbName } =
      connection;

    try {
      // Search the type base on id on the databasetype table
      const dbType = await this.connectionRepository.manager.connection
        .getRepository('Databasetype')
        .findOneBy({ id: dbTypeId });

      if (!dbType) {
        throw new Error('Database type not found');
      }

      console.log(`Testing connection to ${dbType} database...`);

      // Create a temporary DataSource configuration
      const dataSource = new DataSource({
        type: dbType.type as any, // Cast to TypeORM's DatabaseType
        host: dbHost,
        port: dbPort,
        username: dbUsername,
        password: dbPassword,
        database: dbName,
        synchronize: false,
        logging: false,
      });

      // Initialize and check connection
      const db = await dataSource.initialize();
      const schema = await db.query(`${dbType.query}`);
      await dataSource.destroy(); // Close connection after test

      return HttpStatus.CREATED;
    } catch (error) {
      console.error('Connection test failed:', error.message);
      throw new HttpException(
        {
          status: 'error',
          message: error.message,
        },
        400,
      );
    }
  }

  async testConnectionByIdConnection(id: number) {
    try {
      // get connection by id
      const conn = await this.findOne(id);
      if (!conn) return HttpStatus.NOT_FOUND;

      // Create a temporary DataSource configuration
      const dataSource = new DataSource({
        type: conn.databasetype.type as any, // Cast to TypeORM's DatabaseType
        host: conn.dbHost,
        port: conn.dbPort,
        username: conn.dbUsername,
        password: conn.dbPassword,
        database: conn.dbName,
        synchronize: false,
        logging: false,
      });

      await dataSource.initialize(); // Initialize and check connection
      await dataSource.destroy(); // Close connection after test

      await this.updateConnectionStatus(id, true); // Update connection status to true

      return HttpStatus.CREATED;
    } catch (error) {
      console.error('Connection test failed:', error.message);
      await this.updateConnectionStatus(id, false); // Update connection status to false
      throw new HttpException(
        {
          status: 'error',
          message: error.message,
        },
        400,
      );
    }
  }
}
