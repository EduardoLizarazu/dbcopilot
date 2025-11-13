import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateHumanFeedbackDto } from './dto/create-human-feedback.dto';
import { UpdateHumanFeedbackDto } from './dto/update-human-feedback.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HumanFeedback } from './entities/human-feedback.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class HumanFeedbackService {
  constructor(
    @InjectRepository(HumanFeedback)
    private humanFeedbackRepository: Repository<HumanFeedback>,
    private dataSource: DataSource, // Inject the DataSource for transaction management
  ) {}

  async create(createHumanFeedbackDto: CreateHumanFeedbackDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Check if the HumanFeedback already exists for the given prompt ID
      const exitingHumanFb = await this.findByPromptId(
        createHumanFeedbackDto.promptId,
      );

      console.log('exitingHumanFb', exitingHumanFb);

      // If it exists, update it
      if (exitingHumanFb) {
        await this.updateByPromptId(
          createHumanFeedbackDto.promptId,
          createHumanFeedbackDto,
        );
        return;
      }

      // If it doesn't exist, create a new one
      console.log('createHumanFeedbackDto', createHumanFeedbackDto);

      // Save the human feedback to the database
      const createdHumanFb = await queryRunner.manager.save(HumanFeedback, {
        ...createHumanFeedbackDto,
        prompt: { id: createHumanFeedbackDto.promptId },
      });
      console.log('createdHumanFb', createdHumanFb);
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error('Error creating human feedback:', error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException();
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      return await queryRunner.manager.find(HumanFeedback);
    } catch (error) {
      console.error('Error creating human feedback:', error);
      throw new BadRequestException();
    } finally {
      await queryRunner.release();
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} humanFeedback`;
  }

  async findByPromptId(promptId: number) {
    try {
      // Fetch human feedback by prompt ID from the database
      const humanFeedback = await this.humanFeedbackRepository.findOne({
        where: { prompt: { id: promptId } },
      });
      return humanFeedback;
    } catch (error) {
      console.error('Error fetching human feedback:', error);
      throw new BadRequestException();
    }
  }

  async updateByPromptId(
    promptId: number,
    updateHumanFeedbackDto: UpdateHumanFeedbackDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const hf = {
        promptId: promptId,
        isLike: updateHumanFeedbackDto.isLike,
        message: updateHumanFeedbackDto.message || '',
      };
      console.log(
        `Updating human-feedback by prompt #${hf.promptId} id with data: ${hf}`,
      );

      if (!hf.promptId) {
        console.error(`human-feedback prompt id can not be ${hf.promptId}`);
        throw new BadRequestException();
      }

      if (typeof hf.isLike !== 'boolean') {
        console.error(`human-feedback "isLike" can not be ${hf.isLike}`);
        throw new BadGatewayException();
      }

      // Update the human feedback in the database
      await queryRunner.manager.query(
        `UPDATE human_feedback SET "isLike"=$1, message=$2
        WHERE "promptId"=$3`,
        [hf.isLike, hf.message, hf.promptId],
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      console.error('Error updating human feedback:', error);
      await queryRunner.rollbackTransaction();
      throw new BadGatewayException();
    } finally {
      await queryRunner.release();
    }
  }

  update(id: number, updateHumanFeedbackDto: UpdateHumanFeedbackDto) {
    return `This action updates a #${id} humanFeedback`;
  }

  remove(id: number) {
    return `This action removes a #${id} humanFeedback`;
  }
}
