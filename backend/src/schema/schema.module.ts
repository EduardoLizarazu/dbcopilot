import { Module } from '@nestjs/common';
import { SchemaService } from './schema.service';
import { SchemaController } from './schema.controller';
import { TableModule } from './table/table.module';
import { ColumnModule } from './column/column.module';
import { RelationModule } from './relation/relation.module';
import { ColumnTableModule } from './column-table/column-table.module';
import { ColumnTableModule } from './column_table/column_table.module';

@Module({
  controllers: [SchemaController],
  providers: [SchemaService],
  imports: [TableModule, ColumnModule, RelationModule, ColumnTableModule],
})
export class SchemaModule {}
