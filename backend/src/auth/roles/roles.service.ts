import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    if ((await this.findByName(createRoleDto.name)).length > 0)
      throw new Error('Role already exists');
    const role = this.rolesRepository.create(createRoleDto);
    return await this.rolesRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return await this.rolesRepository.find();
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) throw NotFoundException;
    return role;
  }

  async findOneWithPermissions(id: number): Promise<Role> {
    const roleWithPermissions = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!roleWithPermissions) throw NotFoundException;
    return roleWithPermissions;
  }

  async findByName(name: string): Promise<Role[]> {
    const role = await this.rolesRepository.find({ where: { name } });
    if (!role) throw NotFoundException;
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    await this.findOne(id);
    if (updateRoleDto.name) {
      if ((await this.findByName(updateRoleDto.name)).length > 0)
        throw new Error('Role already exists');
    }
    return await this.rolesRepository.update(id, updateRoleDto);
  }

  // Update the permissions of the role
  async updatePermissions(id: number, permissionIds: number[]) {
    // Check if the role exists
    const role = await this.findOne(id);

    // Load the permissions of the role
    const permissions = await this.rolesRepository
      .createQueryBuilder()
      .relation(Role, 'permissions')
      .of(role)
      .loadMany();

    // Update the permissions of the
    await this.rolesRepository
      .createQueryBuilder()
      .relation(Role, 'permissions')
      .of(role)
      .addAndRemove(
        permissionIds,
        permissions.map((p: { id: number }) => p.id),
      );

    // Return the updated role
    return await this.findOneWithPermissions(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.rolesRepository.delete(id);
  }
}
