import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { DataSource } from 'typeorm';

type SimpleUser = {
  user_id: number;
  user_name: string;
  user_username: string;
  user_password?: string; // Consider hashing/salting passwords and not transmitting raw passwords
  role_name?: string;
};

type ReformattedUser = {
  user_id: number;
  user_name: string;
  user_username: string;
  user_password?: string;
  roles: string[];
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private dataSource: DataSource,
  ) {}

  async validateUser({ username, password }: LoginDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userList: SimpleUser[] = await queryRunner.manager.query(
        `SELECT 
          u.id AS "user_id",
          u.name AS "user_name",
          u.username AS "user_username",
          u.password AS "user_password",
          r.name AS "role_name"
        FROM "user" u
        JOIN user_roles_role ur 
        ON ur."userId"=u.id
        JOIN role r 
        ON r.id=ur."roleId"
        WHERE u.username=$1;
      `,
        [username],
      );

      const user = this.reformatUserList(userList);

      console.log('validate user service: ', user);

      if (!user || !user.user_password) {
        console.log(
          'auth.service no user or no password found: ',
          user?.user_password,
        );

        return null;
      }
      const isMatch = await bcrypt.compare(
        password,
        user.user_password as string,
      );
      if (!isMatch) {
        console.log('auth service isMatch null: ', isMatch);
        return null;
      }

      delete user.user_password;
      console.log('auth.service without password: ', user);

      return user;
    } catch (error) {
      console.error('Error Validate User: ', error);
      return null;
    }
  }

  login(user: { username: string; id: number; roles: string[] }) {
    console.log('login auth service: ', user);

    const payload = {
      username: user.username,
      sub: user.id,
      roles: user.roles,
    };
    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
    };
  }

  reformatUserList(userList: SimpleUser[]): ReformattedUser | null {
    if (userList.length === 0) return null;

    // Initialize with first user's data
    const baseUser = {
      user_id: userList[0].user_id,
      user_name: userList[0].user_name,
      user_username: userList[0].user_username,
      user_password: userList[0].user_password,
      roles: new Set<string>(),
    };

    // Collect unique roles
    userList.forEach((user) => {
      if (user.role_name) {
        baseUser.roles.add(user.role_name);
      }
    });

    return {
      ...baseUser,
      roles: Array.from(baseUser.roles),
    };
  }
}
