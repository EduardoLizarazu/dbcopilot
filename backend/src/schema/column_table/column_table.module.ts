import { Module } from '@nestjs/common';
import { ColumnTableService } from './column_table.service';
import { ColumnTableController } from './column_table.controller';

@Module({
  controllers: [ColumnTableController],
  providers: [ColumnTableService],
})
export class ColumnTableModule {}
