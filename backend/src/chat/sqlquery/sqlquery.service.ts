import { Injectable } from '@nestjs/common';
import { CreateSqlqueryDto } from './dto/create-sqlquery.dto';
import { UpdateSqlqueryDto } from './dto/update-sqlquery.dto';

@Injectable()
export class SqlqueryService {
  create(createSqlqueryDto: CreateSqlqueryDto) {
    return 'This action adds a new sqlquery';
  }

  findAll() {
    return `This action returns all sqlquery`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sqlquery`;
  }

  update(id: number, updateSqlqueryDto: UpdateSqlqueryDto) {
    return `This action updates a #${id} sqlquery`;
  }

  remove(id: number) {
    return `This action removes a #${id} sqlquery`;
  }
}
