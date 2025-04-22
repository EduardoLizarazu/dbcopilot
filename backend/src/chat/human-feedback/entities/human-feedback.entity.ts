import { Prompt } from 'src/chat/prompt/entities/prompt.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('human_feedback')
export class HumanFeedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  isLike: boolean;

  @Column()
  message: string;

  @OneToOne(() => Prompt, {
    cascade: true,
  })
  @JoinColumn()
  prompt: Prompt;
}
