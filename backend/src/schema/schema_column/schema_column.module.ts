import { Module } from '@nestjs/common';
import { SchemaColumnService } from './schema_column.service';
import { SchemaColumnController } from './schema_column.controller';

@Module({
  controllers: [SchemaColumnController],
  providers: [SchemaColumnService],
})
export class SchemaColumnModule {}
