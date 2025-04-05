import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SchemaTableService } from './schema_table.service';
import { CreateSchemaTableDto } from './dto/create-schema_table.dto';
import { UpdateSchemaTableDto } from './dto/update-schema_table.dto';

@Controller('schema-table')
export class SchemaTableController {
  constructor(private readonly schemaTableService: SchemaTableService) {}

  @Post()
  create(@Body() createSchemaTableDto: CreateSchemaTableDto) {
    return this.schemaTableService.create(createSchemaTableDto);
  }

  @Get()
  findAll() {
    return this.schemaTableService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schemaTableService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSchemaTableDto: UpdateSchemaTableDto) {
    return this.schemaTableService.update(+id, updateSchemaTableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schemaTableService.remove(+id);
  }
}
