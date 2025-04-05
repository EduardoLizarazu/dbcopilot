import { Module } from '@nestjs/common';
import { SchemaService } from './schema.service';
import { SchemaController } from './schema.controller';
import { TableModule } from './table/table.module';
import { ColumnModule } from './column/column.module';
import { RelationModule } from './relation/relation.module';
import { ColumnTableModule } from './column-table/column-table.module';
import { ColumnTableModule } from './column_table/column_table.module';
import { SchematableModule } from './schematable/schematable.module';
import { SchemacolumnModule } from './schemacolumn/schemacolumn.module';
import { SchemarelationModule } from './schemarelation/schemarelation.module';
import { SchemaTableModule } from './schema_table/schema_table.module';
import { SchemaColumnModule } from './schema_column/schema_column.module';
import { SchemaRelationModule } from './schema_relation/schema_relation.module';

@Module({
  controllers: [SchemaController],
  providers: [SchemaService],
  imports: [TableModule, ColumnModule, RelationModule, ColumnTableModule, SchematableModule, SchemacolumnModule, SchemarelationModule, SchemaTableModule, SchemaColumnModule, SchemaRelationModule],
})
export class SchemaModule {}
