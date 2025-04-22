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
      const humanFeedback = this.humanFeedbackRepository.create({
        ...createHumanFeedbackDto,
        prompt: { id: createHumanFeedbackDto.promptId },
      });
      const humanFeedbackSaved =
        await this.humanFeedbackRepository.save(humanFeedback);
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

  update(id: number, updateHumanFeedbackDto: UpdateHumanFeedbackDto) {
    return `This action updates a #${id} humanFeedback`;
  }

  remove(id: number) {
    return `This action removes a #${id} humanFeedback`;
  }
}
