// src/user/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: { email: string; password: string }) {
    return this.userService.createUser(
      createUserDto.email,
      createUserDto.password,
    );
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: { email: string },
  ) {
    return this.userService.updateUser(id, updateUserDto.email);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.removeUser(id);
  }
}
