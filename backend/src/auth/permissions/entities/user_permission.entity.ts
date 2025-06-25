// src/usuario_permiso/usuario-permiso.entity.ts
import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Permission } from 'src/auth/permissions/entities/permission.entity';

@Entity('user_permission') // Specifies the table name as 'usuario_permiso'
export class UserPermission {
  // Composite Primary Key definition
  // These columns also act as Foreign Keys
  @Column({ primary: true, name: 'user_id' })
  userId: number;

  @Column({ primary: true, name: 'permission_id' })
  permissionId: number;

  @Column({ default: false }) // Corresponds to 'esta_activo' column
  isActive: boolean;

  // Define the Many-to-One relationship to Usuario
  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Define the Many-to-One relationship to Permiso
  @ManyToOne(() => Permission, (perm) => perm.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
