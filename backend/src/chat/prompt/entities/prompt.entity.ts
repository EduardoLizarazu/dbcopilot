import { Sqlquery } from 'src/chat/sqlquery/entities/sqlquery.entity';
import { User } from 'src/users/entities/user.entity';
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

  @Column({ nullable: true })
  title: string;

  @Column()
  prompt: string;

  @ManyToOne(() => User, (user) => user.prompts, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  user: User;

  @Column({ nullable: true })
  is_user_deletion: boolean;

  @Column({ nullable: true })
  sql_query: string;

  @Column({ nullable: true })
  message_error: string;

  @OneToMany(() => Sqlquery, (sqlQuery) => sqlQuery.prompt)
  sqlQueries: Sqlquery[];
}
