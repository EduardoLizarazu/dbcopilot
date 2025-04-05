import { Module } from '@nestjs/common';
import { SchemaService } from './schema.service';
import { SchemaController } from './schema.controller';
import { SchemaTableModule } from './schema_table/schema_table.module';
import { SchemaColumnModule } from './schema_column/schema_column.module';
import { SchemaRelationModule } from './schema_relation/schema_relation.module';

@Module({
  controllers: [SchemaController],
  providers: [SchemaService],
  imports: [SchemaTableModule, SchemaColumnModule, SchemaRelationModule],
})
export class SchemaModule {}
