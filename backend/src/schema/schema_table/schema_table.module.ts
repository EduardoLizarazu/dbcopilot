import { Module } from '@nestjs/common';
import { SchemaTableService } from './schema_table.service';
import { SchemaTableController } from './schema_table.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchemaTable } from './entities/schema_table.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SchemaTable])], // Add your entities here if needed
  controllers: [SchemaTableController],
  providers: [SchemaTableService],
})
export class SchemaTableModule {}
