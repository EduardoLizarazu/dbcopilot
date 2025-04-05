import { Module } from '@nestjs/common';
import { SchemaTableService } from './schema_table.service';
import { SchemaTableController } from './schema_table.controller';

@Module({
  controllers: [SchemaTableController],
  providers: [SchemaTableService],
})
export class SchemaTableModule {}
