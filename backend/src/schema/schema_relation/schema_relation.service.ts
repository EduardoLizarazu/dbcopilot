import { Injectable } from '@nestjs/common';
import { CreateSchemaRelationDto } from './dto/create-schema_relation.dto';
import { UpdateSchemaRelationDto } from './dto/update-schema_relation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SchemaRelation } from './entities/schema_relation.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SchemaRelationService {
  constructor(
    @InjectRepository(SchemaRelation)
    private schemaRelationRepository: Repository<SchemaRelation>,
  ) {}
  create(createSchemaRelationDto: CreateSchemaRelationDto) {
    try {
      const schemaRelation = this.schemaRelationRepository.create(createSchemaRelationDto);
      return this.schemaRelationRepository.save(schemaRelation);
    } catch (error) {
      console.error('Error creating schema relation:', error);
      throw new Error('Failed to create schema relation');
    }
  }

  findAll() {
    try {
      return this.schemaRelationRepository.find({
        relations: ['columnIdFather', 'columnIdChild'],
      });  
    } catch (error) {
      console.error('Error fetching all schema relations:', error);
      throw new Error('Failed to fetch schema relations');
    }
  }

  findOne(id: number) {
    try {
      return this.schemaRelationRepository.findOne({
        where: { columnIdFather: id }, // Explicitly specify the property
        relations: ['columnIdFather', 'columnIdChild'],
      });
    } catch (error) {
      console.error('Error fetching schema relation:', error);
      throw new Error('Failed to fetch schema relation');
    }
  }

  update(id: number, updateSchemaRelationDto: UpdateSchemaRelationDto) {
    try {
      return this.schemaRelationRepository.update(id, updateSchemaRelationDto);
    } catch (error) {
      console.error('Error updating schema relation:', error);
      throw new Error('Failed to update schema relation');
    }
  }

  remove(id: number) {
    try {
      return this.schemaRelationRepository.delete(id);
    } catch (error) {
      console.error('Error deleting schema relation:', error);
      throw new Error('Failed to delete schema relation');
    }
  }
}
