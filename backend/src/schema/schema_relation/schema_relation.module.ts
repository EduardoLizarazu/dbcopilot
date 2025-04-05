import { Module } from '@nestjs/common';
import { SchemaRelationService } from './schema_relation.service';
import { SchemaRelationController } from './schema_relation.controller';

@Module({
  controllers: [SchemaRelationController],
  providers: [SchemaRelationService],
})
export class SchemaRelationModule {}
