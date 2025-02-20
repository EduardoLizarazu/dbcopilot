import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ClientRole } from 'src/auth/enums/role.enum';
import { Permission } from 'src/auth/permissions/entities/permission.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: ClientRole;

  @Column({ type: 'integer', default: 999 })
  rank: number;

  @ManyToMany(() => User, (user) => user.roles)
  users?: User[];

  @ManyToMany(() => Permission)
  @JoinTable()
  permissions?: Permission[];
}
