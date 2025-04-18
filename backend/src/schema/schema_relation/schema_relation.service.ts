import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateSchemaRelationDto } from './dto/create-schema_relation.dto';
import { UpdateSchemaRelationDto } from './dto/update-schema_relation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SchemaRelation } from './entities/schema_relation.entity';
import { Repository } from 'typeorm';
import { FindByIdSchemaRelationDto } from './dto/find-by-id-schema_relation.dto';

@Injectable()
export class SchemaRelationService {
  constructor(
    @InjectRepository(SchemaRelation)
    private schemaRelationRepository: Repository<SchemaRelation>,
  ) {}
  async create(createSchemaRelationDto: CreateSchemaRelationDto) {
    try {
      // Verify the DTO using zod
      const verifiedData = createSchemaRelationDto.verified();
      if (!verifiedData) return HttpStatus.BAD_REQUEST;
      const schemaRelation = this.schemaRelationRepository.create(verifiedData);
      await this.schemaRelationRepository.save(schemaRelation);
      return HttpStatus.CREATED;
    } catch (error) {
      console.error('Error creating schema relation:', error);
      return HttpStatus.BAD_REQUEST;
    }
  }

  async findAll() {
    try {
      return await this.schemaRelationRepository.find();
    } catch (error) {
      console.error('Error fetching all schema relations:', error);
      throw new Error('Failed to fetch schema relations');
    }
  }

  async findOne(data: FindByIdSchemaRelationDto) {
    try {
      const res = await this.schemaRelationRepository.findOne({
        where: {
          columnIdFather: data.columnIdFather,
          columnIdChild: data.columnIdChild,
        },
      });
      if (!res) return HttpStatus.NOT_FOUND;
      return res;
    } catch (error) {
      console.error('Error fetching schema relation:', error);
      return HttpStatus.BAD_REQUEST;
    }
  }

  async update(updateSchemaRelationDto: UpdateSchemaRelationDto) {
    try {
      console.log('updateSchemaRelationDto', updateSchemaRelationDto);
      const resFindOne = await this.findOne({
        columnIdFather: updateSchemaRelationDto.columnIdFather || 0, // Provide a default value
        columnIdChild: updateSchemaRelationDto.columnIdChild || 0, // Provide a default value
      });

      if (resFindOne === HttpStatus.NOT_FOUND) return HttpStatus.NOT_FOUND;
      if (
        resFindOne &&
        typeof resFindOne === 'object' &&
        'isStatic' in resFindOne &&
        resFindOne.isStatic
      ) {
        console.log('resFindOne.isStatic', resFindOne.isStatic);
        return HttpStatus.FORBIDDEN;
      }
      console.log('resFindOne', resFindOne);

      const updateData = await this.schemaRelationRepository.update(
        {
          columnIdFather: updateSchemaRelationDto.columnIdFather,
          columnIdChild: updateSchemaRelationDto.columnIdChild,
        },
        {
          description: updateSchemaRelationDto.description, // Include description here
          isStatic: false,
        },
      );
      console.log('updateData', updateData);
      if (updateData.affected === 1) return HttpStatus.PARTIAL_CONTENT;
      return HttpStatus.NOT_ACCEPTABLE;
    } catch (error) {
      console.error('Error updating schema relation:', error);
      return HttpStatus.BAD_REQUEST;
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
