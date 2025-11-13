import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccountStatus } from './enums/user.enums';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  // @UseGuards(JwtAuthGuard)
  // findAll(@CurrentUser() user): Promise<User[]> {
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Get(':id/roles')
  findOneWithRoles(@Param('id') id: string) {
    return this.usersService.findOneWithRoles(+id);
  }

  @Get(':id/direct-permissions')
  findOneWithDirectPermissions(@Param('id') id: string) {
    return this.usersService.findOneWithDirectPermissions(+id);
  }

  @Get(':id/roles-permissions-direct-permissions')
  findOneWithRolesAndPermissions(@Param('id') id: string) {
    return this.usersService.findOneWithRolesPermissionAndDirectPermissions(
      +id,
    );
  }

  @Post()
  create(@Body() user: CreateUserDto) {
    return this.usersService.create(user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return this.usersService.update(+id, user);
  }

  @Patch(':id/account-status')
  updateAccountStatus(
    @Param('id') id: string,
    @Body() accountStatus: AccountStatus,
  ) {
    return this.usersService.updateAccountStatus(+id, accountStatus);
  }

  @Patch(':id/password')
  updatePassword(@Param('id') id: string, @Body('password') password: string) {
    return this.usersService.updatePassword(+id, password);
  }

  @Put(':id/roles')
  updateRoles(@Param('id') id: string, @Body('roles') roles: number[]) {
    return this.usersService.updateRoles(+id, roles);
  }

  @Put(':id/direct-permissions')
  updateDirectPermissions(
    @Param('id') id: string,
    @Body('permissions') permissions: number[],
  ) {
    return this.usersService.updateDirectPermissions(+id, permissions);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
