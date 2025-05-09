import { Injectable } from '@nestjs/common';
import { CreateSchemaTableDto } from './dto/create-schema_table.dto';
import { UpdateSchemaTableDto } from './dto/update-schema_table.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SchemaTable } from './entities/schema_table.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SchemaTableService {
  constructor(
    @InjectRepository(SchemaTable)
    private schemaTableRepository: Repository<SchemaTable>,
  ) {}
  async create(createSchemaTableDto: CreateSchemaTableDto) {
    try {
      const schemaTable = this.schemaTableRepository.create({
        ...createSchemaTableDto,
        schemaColumns: createSchemaTableDto.schemaColumns?.map((id) => ({
          id,
        })),
      });
      return await this.schemaTableRepository.save(schemaTable);
    } catch (error) {
      throw new Error(`Error creating schema table: ${error.message}`);
    }
  }

  async createBulk(createSchemaTableDtos: CreateSchemaTableDto[]) {
    try {
      const schemaTables = this.schemaTableRepository.create(
        createSchemaTableDtos.map((dto) => ({
          ...dto,
          schemaColumns: dto.schemaColumns?.map((id) => ({ id })),
        })),
      );
      return await this.schemaTableRepository.save(schemaTables);
    } catch (error) {
      throw new Error(`Error creating bulk schema tables: ${error.message}`);
    }
  }

  async findAll() {
    try {
      return await this.schemaTableRepository.find({
        relations: ['schemaColumns'],
      });
    } catch (error) {
      throw new Error(`Error fetching schema tables: ${error.message}`);
    }
  }

  async findOneById(id: number) {
    try {
      return await this.schemaTableRepository.findOne({
        where: { id },
        relations: ['schemaColumns'],
      });
    } catch (error) {
      throw new Error(
        `Error fetching schema table with id ${id}: ${error.message}`,
      );
    }
  }

  async findOneByTechnicalName(technicalName: string) {
    try {
      return await this.schemaTableRepository.findOne({
        where: { technicalName },
        relations: ['schemaColumns'],
      });
    } catch (error) {
      throw new Error(
        `Error fetching schema table with technical name ${technicalName}: ${error.message}`,
      );
    }
  }

  async findAllBySchemaId(schemaId: number) {
    try {
      const tableBySchema = await this.schemaTableRepository.find({
        where: { schema: { id: schemaId } },
      });
      const schemaTable = tableBySchema.map((table) => ({
        table_id: table.id,
        table_name: table.technicalName,
        table_alias: table.alias,
        table_description: table.description,
      }));
      return schemaTable;
    } catch (error) {
      throw new Error(
        `Error fetching schema tables with schema ID ${schemaId}: ${error.message}`,
      );
    }
  }

  async update(id: number, updateSchemaTableDto: UpdateSchemaTableDto) {
    try {
      const schemaTable = await this.schemaTableRepository.findOne({
        where: { id },
      });
      if (!schemaTable) {
        throw new Error(`Schema table with id ${id} not found`);
      }
      Object.assign(schemaTable, updateSchemaTableDto);
      return await this.schemaTableRepository.save(schemaTable);
    } catch (error) {
      throw new Error(
        `Error updating schema table with id ${id}: ${error.message}`,
      );
    }
  }

  async remove(id: number) {
    try {
      const schemaTable = await this.schemaTableRepository.findOne({
        where: { id },
      });
      if (!schemaTable) {
        throw new Error(`Schema table with id ${id} not found`);
      }
      return await this.schemaTableRepository.remove(schemaTable);
    } catch (error) {
      throw new Error(
        `Error removing schema table with id ${id}: ${error.message}`,
      );
    }
  }
}
