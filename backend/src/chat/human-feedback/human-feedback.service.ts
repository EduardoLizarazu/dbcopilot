import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateHumanFeedbackDto } from './dto/create-human-feedback.dto';
import { UpdateHumanFeedbackDto } from './dto/update-human-feedback.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HumanFeedback } from './entities/human-feedback.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HumanFeedbackService {
  constructor(
    @InjectRepository(HumanFeedback)
    private humanFeedbackRepository: Repository<HumanFeedback>,
  ) {}

  async create(createHumanFeedbackDto: CreateHumanFeedbackDto) {
    try {
      // Check if the HumanFeedback already exists for the given prompt ID
      const exitingHumanFb = await this.findByPromptId(
        createHumanFeedbackDto.promptId,
      );
      if (exitingHumanFb === HttpStatus.INTERNAL_SERVER_ERROR)
        return exitingHumanFb;

      console.log('exitingHumanFb', exitingHumanFb);

      // If it exists, update it
      if (exitingHumanFb) {
        return await this.updateByPromptId(
          createHumanFeedbackDto.promptId,
          createHumanFeedbackDto,
        );
      }

      // If it doesn't exist, create a new one
      console.log('createHumanFeedbackDto', createHumanFeedbackDto);

      // Save the human feedback to the database
      const createdHumanFb = await this.humanFeedbackRepository.save({
        ...createHumanFeedbackDto,
        prompt: { id: createHumanFeedbackDto.promptId },
      });
      console.log('createdHumanFb', createdHumanFb);
      return HttpStatus.CREATED;
    } catch (error) {
      console.error('Error creating human feedback:', error);
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  findAll() {
    return `This action returns all humanFeedback`;
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
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  async updateByPromptId(
    promptId: number,
    updateHumanFeedbackDto: UpdateHumanFeedbackDto,
  ) {
    try {
      // Update the human feedback in the database
      const humanFeedbackUpdated = await this.humanFeedbackRepository.update(
        { prompt: { id: promptId } },
        {
          isLike: updateHumanFeedbackDto.isLike,
          message: updateHumanFeedbackDto.message,
        },
      );
      console.log('humanFeedbackUpdated', humanFeedbackUpdated);

      return HttpStatus.OK;
    } catch (error) {
      console.error('Error updating human feedback:', error);
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  update(id: number, updateHumanFeedbackDto: UpdateHumanFeedbackDto) {
    return `This action updates a #${id} humanFeedback`;
  }

  remove(id: number) {
    return `This action removes a #${id} humanFeedback`;
  }
}
