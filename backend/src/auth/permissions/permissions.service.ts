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

  async findByName(name: string): Promise<Permission[]> {
    const permissions = await this.permissionRepository.find({
      where: { name },
    });
    return permissions;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    await this.findOne(id);
    if (updatePermissionDto.name) {
      if ((await this.findByName(updatePermissionDto.name)).length > 0)
        throw new Error('Permission already exists');
    }
    return await this.permissionRepository.update(id, updatePermissionDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.permissionRepository.delete(id);
  }
}
