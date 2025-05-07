import { Module } from '@nestjs/common';
import { SchemaService } from './schema.service';
import { SchemaController } from './schema.controller';
import { SchemaTableModule } from './schema_table/schema_table.module';
import { SchemaColumnModule } from './schema_column/schema_column.module';
import { SchemaRelationModule } from './schema_relation/schema_relation.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchemaTable } from './schema_table/entities/schema_table.entity';
import { SchemaColumn } from './schema_column/entities/schema_column.entity';
import { SchemaRelation } from './schema_relation/entities/schema_relation.entity';
import { Schema } from './entities/schema.entity';

@Module({
  controllers: [SchemaController],
  providers: [SchemaService],
  imports: [
    TypeOrmModule.forFeature([
      SchemaTable,
      SchemaColumn,
      SchemaRelation,
      Schema,
    ]),
    SchemaTableModule,
    SchemaColumnModule,
    SchemaRelationModule,
  ],
})
export class SchemaModule {}
