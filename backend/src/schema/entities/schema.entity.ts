import { Connection } from 'src/connection/entities/connection.entity';
import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SchemaTable } from '../schema_table/entities/schema_table.entity';
import { Prompt } from 'src/chat/prompt/entities/prompt.entity';

@Entity('schema')
export class Schema {
  @PrimaryGeneratedColumn()
  id: number;

  // One to one relationship with Connection nullable
  @OneToOne(() => Connection, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  connection: Connection;

  @OneToMany(() => SchemaTable, (schemaTable) => schemaTable.schema, {
    onDelete: 'CASCADE',
  })
  schemaTables: SchemaTable[];

  @OneToMany(() => Prompt, (prompt) => prompt.schema)
  prompts: Prompt[];
}
