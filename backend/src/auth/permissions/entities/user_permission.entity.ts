// src/usuario_permiso/usuario-permiso.entity.ts
import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Permission } from 'src/auth/permissions/entities/permission.entity';

@Entity('user_permission') // Specifies the table name as 'usuario_permiso'
export class UserPermission {
  // Composite Primary Key definition
  // These columns also act as Foreign Keys
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'permission_id' })
  permissionId: number;

  @Column({ default: false }) // Corresponds to 'esta_activo' column
  isActive: boolean;

  // Define the Many-to-One relationship to Usuario
  @ManyToOne(() => User, (user) => user, {
    onDelete: 'CASCADE',
  })
  // No @JoinColumn needed here if PrimaryColumn names match FK column names,
  // but explicitly setting it can be clearer if you want to use different property names.
  user: User;

  // Define the Many-to-One relationship to Permiso
  @ManyToOne(() => Permission, (perm) => perm.userPermissions, {
    onDelete: 'CASCADE',
  })
  // No @JoinColumn needed here
  permission: Permission;
}
