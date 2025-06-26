import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DataSource, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserDemoDto } from './dto/update-demo-user.dto';
import { User } from './entities/user.entity';
import { AccountStatus } from './enums/user.enums';
import { Role } from 'src/auth/roles/entities/role.entity';
import { Permission } from 'src/auth/permissions/entities/permission.entity';
import { UserPermission } from 'src/auth/permissions/entities/user_permission.entity';

type TUser = {
  name: string;
  username: string;
  password: string;
  roles: TRole[];
};

type TRole = {
  id: number;
  name: string;
  description?: string;
  permissions: TPermission[];
};

type TPermission = {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource, // Inject the DataSource for transaction management
  ) {}

  async create(dto: CreateUserDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { username, password, name, roles } = dto;

      // 1. Hash password
      const salt = await bcrypt.genSalt();
      const hashedPassword = dto.password
        ? await bcrypt.hash(dto.password, salt)
        : null;

      // Format role [ 1 ]
      const rolesId = roles.map((role) => role.id);

      // Format special permission [ [ { id: 1, isActive: true }, { id: 2, isActive: true } ] ]
      const specialPerm = roles
        .map((role) => {
          return role.permissions.map((perm) => {
            return { id: perm.id, isActive: perm.isActive };
          });
        })
        .flat();

      // 2. Create user entity
      console.log('user before queried');

      const userId = await queryRunner.manager.query(
        `INSERT INTO "user" (username, password, name)
        VALUES ($1, $2, $3) RETURNING id`,
        [username, hashedPassword, name],
      );

      console.log('user after queried: ', userId);

      rolesId.forEach(async (roleId) => {
        await queryRunner.manager.query(
          `INSERT INTO user_roles_role ("userId", "roleId") VALUES ($1, $2)`,
          [userId[0]?.id, roleId],
        );
      });

      // 5. Handle direct permissions
      const permissions = specialPerm.map((perm) =>
        queryRunner.manager.create(UserPermission, {
          userId: userId[0]?.id,
          permissionId: perm.id,
          isActive: perm.isActive,
        }),
      );
      console.log('permissions entities: ', permissions);

      permissions.forEach(async (perm) => {
        await queryRunner.manager.save(UserPermission, {
          userId: perm.userId,
          permissionId: perm.permissionId,
          isActive: perm.isActive,
        });
      });

      console.log('permissions saved');

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Error creating user');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find({
      relations: ['roles', 'userPermissions'],
    });
    return users;
  }

  async findOne(userId: number, withPassword: boolean = false): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: [
        'roles',
        'userPermissions',
        'roles.permissions',
        'userPermissions.permission',
      ],
    });
    if (!user) {
      throw new NotFoundException();
    }

    // Extract password from user object
    if (withPassword) delete (user as Partial<User>).password;

    return user;
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { username } });
  }

  async findOneWithRoles(userId: number): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
  }

  async findOneWithDirectPermissions(userId: number): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['permissions'],
    });
  }

  async findOneWithRolesPermissionAndDirectPermissions(
    userId: number,
  ): Promise<User | null> {
    // Retrieve user with roles, the permissions of the roles and direct permissions
    return await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions', 'permissions'],
      // select: undefined,
    });
  }

  // use to validate user on auth
  async findOneWithRolesAndPermissionsByUsername(
    username: string,
    selectSecrets: boolean = false,
  ): Promise<User | null> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'rolePermission')
      .leftJoinAndSelect('user.permissions', 'permission');

    if (selectSecrets) {
      query.addSelect('user.password');
    }

    return await query.getOne();
  }

  async updateDemo(userId: number, dto: UpdateUserDemoDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException();
    }

    const { roles, permissions, accountStatus } = dto;

    user.roles = roles ?? user.roles;
    // user.permissions = permissions ?? user.permissions;
    user.accountStatus = accountStatus ?? user.accountStatus;

    return await this.usersRepository.save(user);
  }

  async updateProfile(userId: number, dto: UpdateUserDto): Promise<User> {
    await this.findOne(userId);
    await this.usersRepository.update(userId, dto);
    return await this.findOne(userId);
  }

  async updateAccountStatus(
    userId: number,
    accountStatus: AccountStatus,
  ): Promise<User> {
    const user = await this.findOne(userId);

    user.accountStatus = accountStatus;

    return await this.usersRepository.save(user);
  }

  async updatePassword(
    userId: number,
    password: string,
  ): Promise<UpdateResult> {
    await this.findOne(userId);

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const userUpdated = await this.usersRepository.update(userId, {
      password: hashedPassword,
    });
    return userUpdated;
  }

  async updateRoles(userId: number, roleIds: number[]): Promise<User | null> {
    // Check if the user exists
    const user = await this.findOne(userId);

    console.log('roleIds', roleIds);

    // Load the roles of the user
    const roles = await this.usersRepository
      .createQueryBuilder()
      .relation(User, 'roles')
      .of(user)
      .loadMany();

    console.log('roles', roles);

    // Update the roles of the user
    await this.usersRepository
      .createQueryBuilder()
      .relation(User, 'roles')
      .of(user)
      .addAndRemove(
        roleIds,
        roles.map((role: { id: number }) => role.id),
      );

    return await this.findOneWithRoles(userId);
  }

  async updateDirectPermissions(
    userId: number,
    permissionIds: number[],
  ): Promise<User | null> {
    // Check if the user exists
    const user = await this.findOne(userId);

    // Load the permissions of the user
    const permissions = await this.usersRepository
      .createQueryBuilder()
      .relation(User, 'permissions')
      .of(user)
      .loadMany();

    // Update the permissions of the user
    await this.usersRepository
      .createQueryBuilder()
      .relation(User, 'permissions')
      .of(user)
      .addAndRemove(
        permissionIds,
        permissions.map((p: { id: number }) => p.id),
      );

    return await this.findOneWithDirectPermissions(userId);
  }

  async updateRolesAndDirectPermissions(
    userId: number,
    roleIds: number[],
    permissionIds: number[],
  ): Promise<User | null> {
    await this.updateRoles(userId, roleIds);
    await this.updateDirectPermissions(userId, permissionIds);
    return await this.findOneWithRolesPermissionAndDirectPermissions(userId);
  }

  async remove(userId: number, forceDelete: boolean = false) {
    const user = await this.findOne(userId);

    if (user.accountStatus === AccountStatus.Inactive) {
      throw new Error(
        'The user still active, please deactivate the user first',
      );
    }
    if (!forceDelete) throw new Error('You must force the deletion');

    return await this.usersRepository.remove(user);
  }
}
