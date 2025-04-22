import { Sqlquery } from 'src/chat/sqlquery/entities/sqlquery.entity';
import { Connection } from 'src/connection/entities/connection.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'prompt' })
export class Prompt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column()
  prompt: string;

  // A prompt can be used for one and only one connection relation many to one
  @ManyToOne(() => Connection, (connection) => connection.prompts)
  connection: Connection;

  @OneToMany(() => Sqlquery, (sqlQuery) => sqlQuery.prompt)
  sqlQueries: Sqlquery[];
}
