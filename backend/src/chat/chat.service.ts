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

  async findOne(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Find the chat by ID with human-feedback
      const chat = await queryRunner.manager.findOne(Prompt, {
        where: { id: id },
      });
      if (!chat) {
        throw new Error(`Chat with ID ${id} not found`);
      }
      await queryRunner.commitTransaction();

      // Execute the SQL query associated with the chat
      // Note: Assuming chat.sql contains the SQL query to be executed
      if (!chat.sql_query) {
        throw new Error(`No SQL query associated with chat ID ${id}`);
      }
      const results = await this.executeSQLQuery(chat.sql_query);

      console.log('SQL Query results:', results);
      // Return the chat in the desired format
      return {
        chatId: chat.id,
        prompt: chat.prompt,
        results: results || [],
        row_count: results.length || 0,
      };
    } catch (error) {
      console.error('Error in findOne:', error);
      await queryRunner.rollbackTransaction();
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  async executeSQLQuery(sql: string) {
    try {
      const dataSource = new DataSource({
        type: 'postgres', // Cast to TypeORM's DatabaseType
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'Passw0rd',
        database: 'northwind',
        synchronize: false,
        logging: false,
      });
      await dataSource.initialize(); // Initialize the DataSource
      const results = await dataSource.query(sql);
      await dataSource.destroy(); // Close the DataSource after use
      return results;
    } catch (error) {
      console.error('Error executing SQL query:', error);
      throw new Error(`Failed to execute SQL query: ${error.message}`);
    }
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
