import { Prompt } from 'src/chat/prompt/entities/prompt.entity';
import { Databasetype } from 'src/databasetype/entities/databasetype.entity';
import { SchemaTable } from 'src/schema/schema_table/entities/schema_table.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Connection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  dbName: string;

  @Column()
  dbHost: string;

  @Column()
  dbPort: number;

  @Column()
  dbUsername: string;

  @Column({ select: false })
  dbPassword?: string;

  @Column({ nullable: true })
  is_connected: boolean;

  // Connection only has one and only one database type
  @ManyToOne(() => Databasetype, (databasetype) => databasetype.connections)
  databasetype: Databasetype;

  @OneToMany(() => SchemaTable, (schemaTable) => schemaTable.connection, {
    onDelete: 'CASCADE',
  })
  schemaTables: SchemaTable[];

  @OneToMany(() => Prompt, (prompt) => prompt.connection)
  prompts: Prompt[];
}
