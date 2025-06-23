import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { DataSource } from 'typeorm';
import { Prompt } from './prompt/entities/prompt.entity';

@Injectable()
export class ChatService {
  constructor(
    private dataSource: DataSource, // Inject the DataSource for transaction management
  ) {}

  create(createChatDto: CreateChatDto) {
    return 'This action adds a new chat';
  }

  async findAll() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const chats = await queryRunner.manager.find(Prompt);
      await queryRunner.commitTransaction();
      // Return the list of chats
      // Ensure this format [{ id: chat.id, prompt: chat.prompt}, ...]
      return chats.map((chat) => ({ id: chat.id, prompt: chat.prompt }));
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
