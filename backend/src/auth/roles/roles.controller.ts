import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
// import { Roles } from '../decorators/roles.decorator';
// import { Permissions } from '../decorators/permissions.decorator';
// import { ClientRole } from '../enums/role.enum';
// import { ClientPermission } from '../enums/permission.enum';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  // @Roles(ClientRole.Admin)
  // @Permissions(ClientPermission.ReadRole)
  async findAll(): Promise<Role[]> {
    return await this.rolesService.findAll();
  }

  @Get(':id')
  // @Roles(ClientRole.Admin)
  // @Permissions(ClientPermission.ReadRole)
  async findOne(@Param('id') id: string) {
    return await this.rolesService.findOne(+id);
  }

  @Get(':id/permissions')
  // @Roles(ClientRole.Admin)
  // @Permissions(ClientPermission.ReadRole)
  async findOneWithPermissions(@Param('id') id: string) {
    return await this.rolesService.findOneWithPermissions(+id);
  }

  @Get(':id/users')
  // @Roles(ClientRole.Admin)
  // @Permissions(ClientPermission.ReadRole)
  async findOneWithUsers(@Param('id') id: string) {
    return await this.rolesService.findOneWithUsers(+id);
  }

  @Put(':id')
  // @Roles(ClientRole.Admin)
  // @Permissions(ClientPermission.UpdateRole)
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return await this.rolesService.update(+id, updateRoleDto);
  }

  @Put(':id/permissions')
  // @Roles(ClientRole.Admin)
  // @Permissions(ClientPermission.UpdateRole)
  async updatePermissions(
    @Param('id') id: string,
    @Body('permissionIds') permissionIds: number[],
  ) {
    return await this.rolesService.updatePermissions(+id, permissionIds);
  }

  @Put(':id/users')
  // @Roles(ClientRole.Admin)
  // @Permissions(ClientPermission.UpdateRole)
  async updateUsers(
    @Param('id') id: string,
    @Body('userIds') userIds: number[],
  ) {
    return await this.rolesService.updateUsers(+id, userIds);
  }

  @Delete(':id')
  // @Roles(ClientRole.Admin)
  // @Permissions(ClientPermission.DeleteRole)
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }
}
