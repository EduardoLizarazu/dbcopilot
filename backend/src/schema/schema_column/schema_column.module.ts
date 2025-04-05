import { Module } from '@nestjs/common';
import { SchemaColumnService } from './schema_column.service';
import { SchemaColumnController } from './schema_column.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchemaColumn } from './entities/schema_column.entity';
import { SchemaColumnKey } from './entities/schema_column_key.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SchemaColumn, SchemaColumnKey])],
  controllers: [SchemaColumnController],
  providers: [SchemaColumnService],
})
export class SchemaColumnModule {}
