import { Injectable } from '@nestjs/common';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';
import { Connection } from './entities/connection.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
  ) {}
  async create(createConnectionDto: CreateConnectionDto) {
    try {
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
}
