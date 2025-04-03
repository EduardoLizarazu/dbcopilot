import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DatabasetypeService } from './databasetype.service';
import { CreateDatabasetypeDto } from './dto/create-databasetype.dto';
import { UpdateDatabasetypeDto } from './dto/update-databasetype.dto';

@Controller('databasetype')
export class DatabasetypeController {
  constructor(private readonly databasetypeService: DatabasetypeService) {}

  @Post()
  create(@Body() createDatabasetypeDto: CreateDatabasetypeDto) {
    try {
      return this.databasetypeService.create(createDatabasetypeDto);
    } catch (error) {
      console.error('Error creating database type:', error);
      throw error; // Rethrow the error to be handled by NestJS
    }
  }

  @Get()
  findAll() {
    try {
      return this.databasetypeService.findAll();
    } catch (error) {
      console.error('Error fetching all database types:', error);
      throw error; // Rethrow the error to be handled by NestJS
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    try {
      return this.databasetypeService.findOneById(+id);
    } catch (error) {
      console.error('Error fetching database type by ID:', error);
      throw error; // Rethrow the error to be handled by NestJS
    }
  }

  @Get(':type')
  findOneByType(@Param('type') type: string) {
    try {
      return this.databasetypeService.findOneByType(type); 
    } catch (error) {
      console.error('Error fetching database type by type:', error);
      throw error; // Rethrow the error to be handled by NestJS
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDatabasetypeDto: UpdateDatabasetypeDto) {
    try {
      return this.databasetypeService.update(+id, updateDatabasetypeDto);
    } catch (error) {
      console.error('Error updating database type:', error);
      throw error; // Rethrow the error to be handled by NestJS
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.databasetypeService.remove(+id);
  }

  @Post('create-test')
  async createTest() {
    const dbTypes = [
      { name: 'PostgreSQL', type: 'postgres', query: 'SELECT * FROM pg_catalog.pg_tables;' },
      { name: 'MySQL', type: 'mysql', query: 'SHOW TABLES;' },
      { name: 'SQLite', type: 'sqlite', query: 'SELECT name FROM sqlite_master WHERE type="table";' },
      { name: 'MSSQL', type: 'mssql', query: 'SELECT * FROM information_schema.tables;' },
    ];

    for (const dbType of dbTypes) {
      await this.databasetypeService.create(dbType);
    }
  }
}
