import { Module } from '@nestjs/common';
import { SchemaGraphService } from './schema-graph.service';
import { SchemaGraphController } from './schema-graph.controller';
import { Neo4jModule } from 'src/neo4j/neo4j/neo4j.module';

@Module({
  imports: [Neo4jModule], // Add this line
  controllers: [SchemaGraphController],
  providers: [SchemaGraphService],
})
export class SchemaGraphModule {}
