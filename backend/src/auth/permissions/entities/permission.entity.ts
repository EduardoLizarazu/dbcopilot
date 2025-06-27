import { Role } from 'src/auth/roles/entities/role.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Role, (role) => role.permissions, {
    cascade: true,
    onDelete: 'CASCADE', // Delete permission will remove from roles
  })
  roles?: Role[];

  @ManyToMany(() => User, (user) => user.userPermissions, {
    cascade: true,
    onDelete: 'CASCADE', // Delete permission will remove from roles
  })
  userPermissions?: User[];
}
