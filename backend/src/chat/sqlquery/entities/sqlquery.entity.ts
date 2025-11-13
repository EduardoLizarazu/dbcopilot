import { Prompt } from 'src/chat/prompt/entities/prompt.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sql_query')
export class Sqlquery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  query: string;

  @ManyToOne(() => Prompt, (prompt) => prompt.sqlQueries)
  prompt: Prompt;
}
