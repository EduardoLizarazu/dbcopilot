import { Module } from '@nestjs/common';
import { SchemaRelationService } from './schema_relation.service';
import { SchemaRelationController } from './schema_relation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchemaRelation } from './entities/schema_relation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SchemaRelation])],
  controllers: [SchemaRelationController],
  providers: [SchemaRelationService],
})
export class SchemaRelationModule {}
