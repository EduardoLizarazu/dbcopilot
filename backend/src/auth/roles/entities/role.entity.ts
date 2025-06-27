import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Permission } from 'src/auth/permissions/entities/permission.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => User, (user) => user.roles, {
    onDelete: 'CASCADE', // Ensure bidirectional cascade
  })
  users?: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    onDelete: 'CASCADE', // Ensure bidirectional cascade
  })
  @JoinTable() // Owning side
  permissions?: Permission[];
}
