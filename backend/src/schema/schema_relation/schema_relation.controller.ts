import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SchemaRelationService } from './schema_relation.service';
import { CreateSchemaRelationDto } from './dto/create-schema_relation.dto';
import { UpdateSchemaRelationDto } from './dto/update-schema_relation.dto';

@Controller('schema-relation')
export class SchemaRelationController {
  constructor(private readonly schemaRelationService: SchemaRelationService) {}

  @Post()
  create(@Body() createSchemaRelationDto: CreateSchemaRelationDto) {
    return this.schemaRelationService.create(createSchemaRelationDto);
  }

  @Get()
  findAll() {
    return this.schemaRelationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schemaRelationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSchemaRelationDto: UpdateSchemaRelationDto) {
    return this.schemaRelationService.update(+id, updateSchemaRelationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schemaRelationService.remove(+id);
  }
}
