import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
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

  async remove(id: number, forceDelete: boolean = false) {
    // Check if the permission has roles
    const permissionWithRoles = await this.findOneWithRoles(id);
    if (permissionWithRoles.roles && permissionWithRoles.roles.length > 0) {
      if (!forceDelete) {
        throw new Error(
          'Permission has roles. Use forceDelete option to remove it along with its roles.',
        );
      }

      // Remove the roles associated with the permission
      await this.permissionRepository
        .createQueryBuilder()
        .relation(Permission, 'roles')
        .of(permissionWithRoles)
        .remove(permissionWithRoles.roles);
    }

    // Check if the permission has users
    const permissionWithUsers = await this.findOneWithUsers(id);
    if (permissionWithUsers.users && permissionWithUsers.users.length > 0) {
      if (!forceDelete) {
        throw new Error(
          'Permission has users. Use forceDelete option to remove it along with its users.',
        );
      }

      // Remove the users associated with the permission
      await this.permissionRepository
        .createQueryBuilder()
        .relation(Permission, 'users')
        .of(permissionWithUsers)
        .remove(permissionWithUsers.users);
    }

    return await this.permissionRepository.delete(id);
  }
}
