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

  async remove(id: number) {
    await this.findOne(id);
    return await this.rolesRepository.delete(id);
  }
}
