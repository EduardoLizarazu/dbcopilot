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
import { SchemaGraphService } from './schema-graph.service';
import { CreateSchemaGraphDto } from './dto/create-schema-graph.dto';
import { UpdateSchemaGraphDto } from './dto/update-schema-graph.dto';

@Controller('schema-graph')
export class SchemaGraphController {
  constructor(private readonly schemaGraphService: SchemaGraphService) {}

  @Post()
  create(@Body() createSchemaGraphDto: CreateSchemaGraphDto) {
    return this.schemaGraphService.create(createSchemaGraphDto);
  }

  @Get()
  findAll() {
    return this.schemaGraphService.findAll();
  }

  @Get('roles/:id')
  findAllByRoleId(@Param('id') id: string) {
    return this.schemaGraphService.findAllByRoleId(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schemaGraphService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSchemaGraphDto: UpdateSchemaGraphDto[],
  ) {
    return this.schemaGraphService.update(+id, updateSchemaGraphDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schemaGraphService.remove(+id);
  }
}
