import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';

@Controller('connection')
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Post()
  create(@Body() createConnectionDto: CreateConnectionDto) {
    try {
      return this.connectionService.create(createConnectionDto);
    } catch (error) {
      console.error('Error creating connection:', error);
      throw new Error('Failed to create connection');
    }
  }

  @Get('all-only-if-is-connected')
  findAllOnlyIfIsConnected() {
    try {
      console.log('Fetching all connections that are connected...');
      return this.connectionService.findAllOnlyIfIsConnectedService();
    } catch (error) {
      console.error('Error fetching connections:', error);
      throw new Error('Failed to fetch connections');
    }
  }

  @Get()
  findAll() {
    try {
      console.log('Fetching all connections...');
      return this.connectionService.findAll();
    } catch (error) {
      console.error('Error fetching connections:', error);
      throw new Error('Failed to fetch connections');
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    try {
      return this.connectionService.findOne(+id);
    } catch (error) {
      console.error('Error fetching connection:', error);
      throw new Error('Failed to fetch connection');
    }
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConnectionDto: UpdateConnectionDto,
  ) {
    try {
      console.log('Updating connection with ID:', id);
      console.log('Update data:', updateConnectionDto);
      return this.connectionService.update(+id, updateConnectionDto);
    } catch (error) {
      console.error('Error updating connection:', error);
      throw new Error('Failed to update connection');
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    try {
      return this.connectionService.remove(+id);
    } catch (error) {
      console.error('Error deleting connection:', error);
      throw new Error('Failed to delete connection');
    }
  }

  @Post('schema-simple')
  findSchema(@Body() createConnectionDto: CreateConnectionDto) {
    return this.connectionService.readSchemaFromConnection(createConnectionDto);
  }

  @Post('test')
  testConnection(@Body() createConnectionDto: CreateConnectionDto) {
    try {
      return this.connectionService.testConnection(createConnectionDto);
    } catch (error) {
      console.error('Error testing connection:', error);
      throw new Error('Failed to test connection');
    }
  }

  @Post('test/:id')
  testConnectionById(@Param('id') id: string) {
    try {
      return this.connectionService.testConnectionByIdConnection(+id);
    } catch (error) {
      console.error('Error testing connection by ID:', error);
      throw new Error('Failed to test connection by ID');
    }
  }
}
