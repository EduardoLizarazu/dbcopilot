import { Injectable } from '@nestjs/common';
import { CreateSchemaColumnDto } from './dto/create-schema_column.dto';
import { UpdateSchemaColumnDto } from './dto/update-schema_column.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SchemaColumn } from './entities/schema_column.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SchemaColumnService {
  constructor(
    @InjectRepository(SchemaColumn)
    private schemaColumnRepository: Repository<SchemaColumn>,
  ) {}
  async create(createSchemaColumnDto: CreateSchemaColumnDto) {
    try {
      const newSchemaColumn = this.schemaColumnRepository.create({
        ...createSchemaColumnDto,
        schemaColumnKeys: createSchemaColumnDto.schemaColumnKeys?.map(id => ({ id })),
      });
      await this.schemaColumnRepository.save(newSchemaColumn);
      return newSchemaColumn;
    }
    catch (error) {
      throw new Error(`Error creating schema column: ${error.message}`);
    }
  }

  async findAll() {
    try {
      return await this.schemaColumnRepository.find({
        relations: ['schemaColumnKeys', 'schemaTable', 'schemaRelationFather', 'schemaRelationChild'],
      });
    } catch (error) {
      throw new Error(`Error fetching schema columns: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      const schemaColumn = await this.schemaColumnRepository.findOne({
        where: { id },
        relations: ['schemaColumnKeys', 'schemaTable', 'schemaRelationFather', 'schemaRelationChild'],
      });
      if (!schemaColumn) {
        throw new Error(`Schema column with ID ${id} not found`);
      }
      return schemaColumn;
    } catch (error) {
      throw new Error(`Error fetching schema column: ${error.message}`);
    }
  }

  async update(id: number, updateSchemaColumnDto: UpdateSchemaColumnDto) {
    try {
      const schemaColumn = await this.schemaColumnRepository.findOne({ where: { id } });
      if (!schemaColumn) {
        throw new Error(`Schema column with ID ${id} not found`);
      }
      Object.assign(schemaColumn, updateSchemaColumnDto);
      await this.schemaColumnRepository.save(schemaColumn);
      return schemaColumn;
    } catch (error) {
      throw new Error(`Error updating schema column: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      const schemaColumn = await this.schemaColumnRepository.findOne({ where: { id } });
      if (!schemaColumn) {
        throw new Error(`Schema column with ID ${id} not found`);
      }
      await this.schemaColumnRepository.remove(schemaColumn);
      return schemaColumn;
    } catch (error) {
      throw new Error(`Error removing schema column: ${error.message}`);
    }
  }
}
