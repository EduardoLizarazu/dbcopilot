import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from 'src/auth/permissions/entities/permission.entity';
import { Role } from 'src/auth/roles/entities/role.entity';
import { AccountStatus } from '../enums/user.enums';
import { UserPermission } from 'src/auth/permissions/entities/user_permission.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: false, select: false })
  password?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ default: AccountStatus.Inactive })
  accountStatus: AccountStatus;

  @ManyToMany(() => Role, (role) => role.users, {
    onDelete: 'CASCADE', // Ensure bidirectional cascade
  })
  @JoinTable()
  roles?: Role[];

  // Ability to also directly assign permissions to user
  // means more flexibility with potentially more complexity
  @OneToMany(() => UserPermission, (userPerm) => userPerm.user, {
    onDelete: 'CASCADE', // Ensure bidirectional cascade
  })
  userPermissions: UserPermission[]; // The list of user-permission associations
}
