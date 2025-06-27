import { Module } from '@nestjs/common';
import { SchemaGraphService } from './schema-graph.service';
import { SchemaGraphController } from './schema-graph.controller';

@Module({
  controllers: [SchemaGraphController],
  providers: [SchemaGraphService],
})
export class SchemaGraphModule {}
