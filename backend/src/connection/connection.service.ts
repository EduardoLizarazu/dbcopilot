import { Injectable } from '@nestjs/common';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';
import { Connection } from './entities/connection.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
  ) {}
  async create(createConnectionDto: CreateConnectionDto) {
    const connection = this.connectionRepository.create(createConnectionDto);
    return await this.connectionRepository.save(connection);
  }

  async findAll() {
    return await this.connectionRepository.find();
  }

  async findOne(id: number) {
    return await this.connectionRepository.findOneBy({ id });
  }

  async update(id: number, updateConnectionDto: UpdateConnectionDto) {
    return await this.connectionRepository.update(id, updateConnectionDto);
  }

  async remove(id: number) {
    return await this.connectionRepository.delete(id);
  }
}
