import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HumanFeedbackService } from './human-feedback.service';
import { CreateHumanFeedbackDto } from './dto/create-human-feedback.dto';
import { UpdateHumanFeedbackDto } from './dto/update-human-feedback.dto';

@Controller('human-feedback')
export class HumanFeedbackController {
  constructor(private readonly humanFeedbackService: HumanFeedbackService) {}

  @Post()
  create(@Body() createHumanFeedbackDto: CreateHumanFeedbackDto) {
    return this.humanFeedbackService.create(createHumanFeedbackDto);
  }

  @Get()
  findAll() {
    return this.humanFeedbackService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.humanFeedbackService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHumanFeedbackDto: UpdateHumanFeedbackDto) {
    return this.humanFeedbackService.update(+id, updateHumanFeedbackDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.humanFeedbackService.remove(+id);
  }
}
