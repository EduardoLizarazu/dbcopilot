import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DatabasetypeService } from './databasetype.service';
import { CreateDatabasetypeDto } from './dto/create-databasetype.dto';
import { UpdateDatabasetypeDto } from './dto/update-databasetype.dto';

@Controller('databasetype')
export class DatabasetypeController {
  constructor(private readonly databasetypeService: DatabasetypeService) {}

  @Post()
  create(@Body() createDatabasetypeDto: CreateDatabasetypeDto) {
    return this.databasetypeService.create(createDatabasetypeDto);
  }

  @Get()
  findAll() {
    return this.databasetypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.databasetypeService.findOneById(+id); 
  }

  @Get(':type')
  findOneByType(@Param('type') type: string) {
    return this.databasetypeService.findOneByType(type); 
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDatabasetypeDto: UpdateDatabasetypeDto) {
    return this.databasetypeService.update(+id, updateDatabasetypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.databasetypeService.remove(+id);
  }
}
