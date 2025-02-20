import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { Permissions } from './decorators/permissions.decorator';
import { ClientRole } from './enums/role.enum';
import { ClientPermission } from './enums/permission.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: Express.Request) {
    if (!req.user) {
      throw new Error('User not found');
    }
    const token = this.authService.login(
      req.user as { username: string; id: number },
    );
    return token;
  }

  @Public()
  @Post('register')
  async register(@Body() body: CreateUserDto) {
    const user = await this.usersService.create(body);
    return user;
  }

  @Get('role')
  @Roles(ClientRole.Admin)
  @Permissions(ClientPermission.ReadRole)
  async getRoles() {
    const roles = await this.authService.findManyRoles();
    return roles;
  }

  @Get('role/:id')
  @Roles(ClientRole.Admin)
  @Permissions(ClientPermission.ReadRole)
  async getRoleById(@Param('id') id: string) {
    const role = await this.authService.findRoleById(+id);
    return role;
  }
}
