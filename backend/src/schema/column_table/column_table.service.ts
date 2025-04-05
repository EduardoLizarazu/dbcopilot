import { Injectable } from '@nestjs/common';
import { CreateColumnTableDto } from './dto/create-column_table.dto';
import { UpdateColumnTableDto } from './dto/update-column_table.dto';

@Injectable()
export class ColumnTableService {
  create(createColumnTableDto: CreateColumnTableDto) {
    return 'This action adds a new columnTable';
  }

  findAll() {
    return `This action returns all columnTable`;
  }

  findOne(id: number) {
    return `This action returns a #${id} columnTable`;
  }

  update(id: number, updateColumnTableDto: UpdateColumnTableDto) {
    return `This action updates a #${id} columnTable`;
  }

  remove(id: number) {
    return `This action removes a #${id} columnTable`;
  }
}
