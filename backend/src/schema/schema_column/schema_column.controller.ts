import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SchemaColumnService } from './schema_column.service';
import { CreateSchemaColumnDto } from './dto/create-schema_column.dto';
import { UpdateSchemaColumnDto } from './dto/update-schema_column.dto';

@Controller('schema-column')
export class SchemaColumnController {
  constructor(private readonly schemaColumnService: SchemaColumnService) {}

  @Post()
  create(@Body() createSchemaColumnDto: CreateSchemaColumnDto) {
    return this.schemaColumnService.create(createSchemaColumnDto);
  }

  @Get()
  findAll() {
    return this.schemaColumnService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schemaColumnService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSchemaColumnDto: UpdateSchemaColumnDto) {
    return this.schemaColumnService.update(+id, updateSchemaColumnDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schemaColumnService.remove(+id);
  }
}
