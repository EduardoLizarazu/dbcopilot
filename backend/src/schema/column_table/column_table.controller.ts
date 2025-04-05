import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ColumnTableService } from './column_table.service';
import { CreateColumnTableDto } from './dto/create-column_table.dto';
import { UpdateColumnTableDto } from './dto/update-column_table.dto';

@Controller('column-table')
export class ColumnTableController {
  constructor(private readonly columnTableService: ColumnTableService) {}

  @Post()
  create(@Body() createColumnTableDto: CreateColumnTableDto) {
    return this.columnTableService.create(createColumnTableDto);
  }

  @Get()
  findAll() {
    return this.columnTableService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.columnTableService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateColumnTableDto: UpdateColumnTableDto) {
    return this.columnTableService.update(+id, updateColumnTableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.columnTableService.remove(+id);
  }
}
