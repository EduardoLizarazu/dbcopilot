import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { Role } from 'src/auth/roles/entities/role.entity';
import { Permission } from 'src/auth/permissions/entities/permission.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private rolesRepository: Repository<Role>,
    private permissionsRepository: Repository<Permission>,
  ) {}

  async validateUser({ username, password }: LoginDto) {
    const user = await this.usersService.findOne(username, true);
    if (!user || !user.password) {
      return null;
    }

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return null;
      }
    } catch (error) {
      console.error('Error Validate User: ', error);
      return null;
    }

    delete (user as Partial<User>).password;

    return user;
  }

  login(user: { username: string; id: number }) {
    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
    };
    // return {
    //   access_token: this.jwtService.sign(payload),
    // };
  }

  async findManyRoles(): Promise<Role[]> {
    return await this.rolesRepository.find();
  }

  async findRoleById(id: number): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new Error('Role not found');
    }
    return role;
  }
}
