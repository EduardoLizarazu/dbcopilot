import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SqlqueryService } from './sqlquery.service';
import { CreateSqlqueryDto } from './dto/create-sqlquery.dto';
import { UpdateSqlqueryDto } from './dto/update-sqlquery.dto';

@Controller('sqlquery')
export class SqlqueryController {
  constructor(private readonly sqlqueryService: SqlqueryService) {}

  @Post()
  create(@Body() createSqlqueryDto: CreateSqlqueryDto) {
    return this.sqlqueryService.create(createSqlqueryDto);
  }

  @Get()
  findAll() {
    return this.sqlqueryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sqlqueryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSqlqueryDto: UpdateSqlqueryDto) {
    return this.sqlqueryService.update(+id, updateSqlqueryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sqlqueryService.remove(+id);
  }
}
