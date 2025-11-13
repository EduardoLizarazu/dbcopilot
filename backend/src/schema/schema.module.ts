import { Module } from '@nestjs/common';
import { SchemaService } from './schema.service';
import { SchemaController } from './schema.controller';
import { Neo4jModule } from 'src/neo4j/neo4j/neo4j.module';

@Module({
  imports: [Neo4jModule], // Add this line
  controllers: [SchemaController],
  providers: [SchemaService],
})
export class SchemaModule {}
