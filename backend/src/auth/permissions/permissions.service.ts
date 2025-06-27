import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private dataSource: DataSource, // Inject the DataSource for transaction management
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const role = this.permissionRepository.create(createPermissionDto);
    if ((await this.findByName(createPermissionDto.name)).length > 0)
      throw new Error('Permission already exists');
    return await this.permissionRepository.save(role);
  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.find();
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) throw NotFoundException;

    return permission;
  }

  async findOneWithRoles(id: number): Promise<Permission> {
    const permissionWithRoles = await this.permissionRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!permissionWithRoles) throw NotFoundException;

    return permissionWithRoles;
  }

  async findOneWithUsers(id: number): Promise<Permission> {
    const permissionWithUsers = await this.permissionRepository.findOne({
      where: { id },
      relations: ['users'],
    });
    if (!permissionWithUsers) throw NotFoundException;
    return permissionWithUsers;
  }

  async findByName(name: string): Promise<Permission[]> {
    const permissions = await this.permissionRepository.find({
      where: { name },
    });
    return permissions;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    try {
      const previousPerm = await this.findOne(id);
      if (updatePermissionDto.name) {
        if (
          (await this.findByName(updatePermissionDto.name)).length > 0 &&
          previousPerm.name !== updatePermissionDto.name
        )
          throw new Error('Permission already exists');
      }
      return await this.permissionRepository.update(id, updatePermissionDto);
    } catch (error) {
      throw new NotFoundException(`Permission with ID ${id} not found.`);
    }
  }

  // Update the roles of the permission
  async updateRoles(id: number, roleIds: number[]) {
    // Check if the permission exists
    const permission = await this.findOne(id);

    // Load the roles of the permission
    const roles = await this.permissionRepository
      .createQueryBuilder()
      .relation(Permission, 'roles')
      .of(permission)
      .loadMany();

    // Find the roles that need to be added
    const rolesToAdd = roleIds.filter(
      (roleId) => !roles.some((role: { id: number }) => role.id === roleId),
    );

    // Find the roles that need to be removed
    const rolesToRemove = roles.filter(
      (role: { id: number }) => !roleIds.some((roleId) => role.id === roleId),
    );

    // Add the roles
    if (rolesToAdd.length > 0) {
      await this.permissionRepository
        .createQueryBuilder()
        .relation(Permission, 'roles')
        .of(permission)
        .add(rolesToAdd);
    }

    // Remove the roles
    if (rolesToRemove.length > 0) {
      await this.permissionRepository
        .createQueryBuilder()
        .relation(Permission, 'roles')
        .of(permission)
        .remove(rolesToRemove);
    }

    return await this.findOneWithRoles(id);
  }

  async updateUsers(id: number, userIds: number[]) {
    // Check if the permission exists
    const permission = await this.findOne(id);

    // Load the users of the permission
    const users = await this.permissionRepository
      .createQueryBuilder()
      .relation(Permission, 'users')
      .of(permission)
      .loadMany();

    // Find the users that need to be added
    const usersToAdd = userIds.filter(
      (userId) => !users.some((user: { id: number }) => user.id === userId),
    );

    // Find the users that need to be removed
    const usersToRemove = users.filter(
      (user: { id: number }) => !userIds.some((userId) => user.id === userId),
    );

    // Add the users
    if (usersToAdd.length > 0) {
      await this.permissionRepository
        .createQueryBuilder()
        .relation(Permission, 'users')
        .of(permission)
        .add(usersToAdd);
    }

    // Remove the users
    if (usersToRemove.length > 0) {
      await this.permissionRepository
        .createQueryBuilder()
        .relation(Permission, 'users')
        .of(permission)
        .remove(usersToRemove);
    }

    return await this.findOneWithUsers(id);
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const entity = await queryRunner.manager.findOne(Permission, {
        where: { id: id },
      });

      if (!entity) {
        throw new NotFoundException(`Permission with ID ${id} not found.`); // Or throw a custom error
      }
      console.log('permission entity to delete', entity);

      // Remove the entity by sql query with its relations
      // Delete related entries in user_permission table
      await queryRunner.manager.query(
        `DELETE FROM user_permission WHERE permission_id = $1`,
        [id],
      );

      // Delete related entries in
      await queryRunner.manager.query(
        `DELETE FROM role_permissions_permission WHERE "permissionId" = $1`,
        [id],
      );

      // Delete the permission from the Permission table
      await queryRunner.manager.query(`DELETE FROM permission WHERE id = $1`, [
        id,
      ]);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error deleting permission: ', error);
      throw new BadRequestException('Error deleting permission');
    } finally {
      await queryRunner.release();
    }
  }
}
