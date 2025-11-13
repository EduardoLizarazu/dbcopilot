import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { DataSource } from 'typeorm';
import { Prompt } from './entities/prompt.entity';
import { Sqlquery } from '../sqlquery/entities/sqlquery.entity';

@Injectable()
export class PromptService {
  constructor(private dataSource: DataSource) {}

  create(createPromptDto: CreatePromptDto) {
    return 'This action adds a new prompt';
  }

  async findAll() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const entities = await queryRunner.manager.find(Prompt);
      return entities;
    } catch (error) {
      console.error(`Error on finding all prompts: ${error}`);
      throw new BadRequestException(`Error finding all prompts.`);
    }
  }

  async findOne(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const entity = await queryRunner.manager.findOne(Prompt, {
        where: { id: id },
      });

      if (!entity)
        throw new NotFoundException(`Prompt with ID ${id} not found.`); // Or throw a custom error

      return entity;
    } catch (error) {
      console.error(`Error on finding prompt: ${error}`);
      throw new BadRequestException(`Error finding prompt.`);
    }
  }

  update(id: number, updatePromptDto: UpdatePromptDto) {
    return `This action updates a #${id} prompt`;
  }

  remove(id: number) {
    return `This action removes a #${id} prompt`;
  }
}
