import { PartialType } from '@nestjs/swagger';
import { CreateHumanFeedbackDto } from './create-human-feedback.dto';

export class UpdateHumanFeedbackDto extends PartialType(CreateHumanFeedbackDto) {}
