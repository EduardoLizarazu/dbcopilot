import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return await this.permissionsService.create(createPermissionDto);
  }

  @Get()
  async findAll() {
    return await this.permissionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.permissionsService.findOne(+id);
  }

  @Get(':id/roles')
  async findOneWithRoles(@Param('id') id: string) {
    return await this.permissionsService.findOneWithRoles(+id);
  }

  @Get(':id/users')
  async findOneWithUsers(@Param('id') id: string) {
    return await this.permissionsService.findOneWithUsers(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return await this.permissionsService.update(+id, updatePermissionDto);
  }

  @Put(':id/roles')
  async updateRoles(
    @Param('id') id: string,
    @Body('roleIds') roleIds: number[],
  ) {
    return await this.permissionsService.updateRoles(+id, roleIds);
  }

  @Put(':id/users')
  async updateUsers(
    @Param('id') id: string,
    @Body('userIds') userIds: number[],
  ) {
    return await this.permissionsService.updateUsers(+id, userIds);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Body('forceDelete') forceDelete?: string,
  ) {
    if (forceDelete === '0') return await this.permissionsService.remove(+id);
    return await this.permissionsService.remove(+id, forceDelete === '1');
  }
}
