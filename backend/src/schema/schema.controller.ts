import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { SchemaService } from './schema.service';
import { CreateSchemaDto } from './dto/create-schema.dto';
import { UpdateSchemaDto } from './dto/update-schema.dto';
import { TSchemaRelationWithKeyType } from './interface/schema_relation_with_key_type';
import { CreateSchemaRelationWithKeyTypeDto } from './dto/create-schema-relation-with-keytype.dto';
import { DeleteSchemaRelationDto } from './schema_relation/dto/detele-schema_relation.dto';

@Controller('schema')
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  @Post('relation-with-keytype')
  createRelation(
    @Body() data: CreateSchemaRelationWithKeyTypeDto,
    @Req() req: Request,
  ) {
    console.log('REQUEST URL:', req.url);
    console.log('REQUEST METHOD:', req.method);
    console.log('createRelation', data);
    return this.schemaService.createRelationWithKeyType(data);
  }

  @Post(':connectionId')
  create(
    @Param('connectionId') connectionId: string,
    @Body() createSchemaDto: CreateSchemaDto[],
    @Req() req: Request,
  ) {
    console.log('REQUEST URL:', req.url);
    console.log('REQUEST METHOD:', req.method);
    console.log('createSchemaDto', createSchemaDto);
    return this.schemaService.create(+connectionId, createSchemaDto);
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

  @Delete('relation-with-keytype')
  removeRelationWithKeyType(
    @Body() data: DeleteSchemaRelationDto,
    @Req() req: Request,
  ) {
    console.log('REQUEST URL:', req.url);
    console.log('REQUEST METHOD:', req.method);
    console.log('removeRelationWithKeyType', data);
    return this.schemaService.removeRelationWithKeyType(data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schemaService.remove(+id);
  }
}
