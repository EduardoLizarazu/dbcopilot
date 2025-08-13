import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { SchemaService } from './schema.service';
import { CreateSchemaDto } from './dto/create-schema.dto';
import { UpdateSchemaDto } from './dto/update-schema.dto';

type SchemaPhysical = {
  table_schema: string;
  table_name: string;
  column_name: string;
  data_type: string;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  referenced_table_schema: string | null;
  referenced_table_name: string | null;
  referenced_column_name: string | null;
};

type SchemaContextualized = {
  id_table_schema: number;
  id_table: number;
  id_column: number;
  table_schema: string;
  table_name: string;
  column_name: string;
  data_type: string;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  referenced_table_schema: string | null;
  referenced_table_name: string | null;
  referenced_column_name: string | null;
  id_referenced_table_schema: number | null;
  id_referenced_table_name: number | null;
  id_referenced_column_name: number | null;
};

type TSchemaDiff = {
  type: 'MISMATCH' | 'MISSING_IN_CONTEXT' | 'MISSING_IN_PHYSICAL';
  table_schema: string;
  table_name: string;
  column_name: string;
  physical_data?: Partial<SchemaPhysical>;
  contextual_data?: Partial<SchemaContextualized>;
  mismatch_details?: string[];
};

@Controller('schema')
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  @Post()
  create(@Body() createSchemaDto: CreateSchemaDto) {
    return this.schemaService.create(createSchemaDto);
  }

  @Get()
  findAll() {
    return this.schemaService.findAll();
  }

  @Get('/diff')
  findDiff() {
    return this.schemaService.findDiff();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schemaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSchemaDto: UpdateSchemaDto) {
    return this.schemaService.update(+id, updateSchemaDto);
  }

  @Put('/diff')
  updateDiff(@Body() diffs: TSchemaDiff[]) {
    return this.schemaService.updateDiff(diffs);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schemaService.remove(+id);
  }
}
