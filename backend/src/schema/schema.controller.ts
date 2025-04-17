import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SchemaService } from './schema.service';
import { CreateSchemaDto } from './dto/create-schema.dto';
import { UpdateSchemaDto } from './dto/update-schema.dto';
import { TSchemaRelationWithKeyType } from './interface/schema_relation_with_key_type';

@Controller('schema')
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  @Post(':connectionId')
  create(
    @Param('connectionId') connectionId: string,
    @Body() createSchemaDto: CreateSchemaDto[],
  ) {
    console.log('createSchemaDto', createSchemaDto);
    return this.schemaService.create(+connectionId, createSchemaDto);
  }

  @Post('create-relation-and-key-type')
  createRelation(@Body() data: TSchemaRelationWithKeyType) {
    console.log('createRelation', data);
    return this.schemaService.createRelationWithKeyType(data);
  }

  @Get()
  findAll() {
    return this.schemaService.findAll();
  }

  @Get(':connectionId')
  findOneByConnectionId(@Param('connectionId') connectionId: string) {
    return this.schemaService.findSchemaByConnectionId(+connectionId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSchemaDto: UpdateSchemaDto) {
    return this.schemaService.update(+id, updateSchemaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schemaService.remove(+id);
  }
}
