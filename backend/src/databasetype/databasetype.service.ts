import { Injectable } from '@nestjs/common';
import { CreateDatabasetypeDto } from './dto/create-databasetype.dto';
import { UpdateDatabasetypeDto } from './dto/update-databasetype.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Databasetype } from './entities/databasetype.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DatabasetypeService {
  constructor(
    @InjectRepository(Databasetype)
    private databasetypeRepository: Repository<Databasetype>,
  ) {}
  async create(createDatabasetypeDto: CreateDatabasetypeDto) {
    try {
      const databasetype = this.databasetypeRepository.create(createDatabasetypeDto);
      return await this.databasetypeRepository.save(databasetype);
    } catch (error) {
      console.error('Error creating databasetype:', error);
      throw new Error('Failed to create databasetype');
      
    }
  }

  async findAll() {
    try {
      return await this.databasetypeRepository.find();
    } catch (error) {
      console.error('Error fetching databasetypes:', error);
      throw new Error('Failed to fetch databasetypes');
    }
  }

  async findOneById(id: number) {
    try {
      return await  this.databasetypeRepository.findOneBy({ id });      
    } catch (error) {
      console.error('Error fetching databasetype:', error);
      throw new Error('Failed to fetch databasetype');
    }
  }

  async findOneByType(type: string) {
    try {
      const dbType = await this.databasetypeRepository.findOneBy({ type });
      if (!dbType) {
        throw new Error('Databasetype not found');
      }
      return dbType;      
    }
    catch (error) {
      console.error('Error fetching databasetype:', error);
      throw new Error('Failed to fetch databasetype');
    }
  }

  async update(id: number, updateDatabasetypeDto: UpdateDatabasetypeDto) {
    try {
      return await this.databasetypeRepository.update(id, updateDatabasetypeDto);      
    } catch (error) {
      console.error('Error updating databasetype:', error);
      throw new Error('Failed to update databasetype');
    }
  }

  async remove(id: number) {
    try {
      return await this.databasetypeRepository.delete(id);      
    } catch (error) {
      console.error('Error deleting databasetype:', error);
      throw new Error('Failed to delete databasetype');
    }
  }
}
