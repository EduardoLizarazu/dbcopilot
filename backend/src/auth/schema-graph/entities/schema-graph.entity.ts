import { Role } from 'src/auth/roles/entities/role.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('schema_graph')
export class SchemaGraph {
  @Column({ primary: true, name: 'role_id' })
  roleId: number;

  @Column({ primary: true, name: 'column_id' })
  columnId: number;

  @Column({ name: 'table_id' })
  tableId: number;

  // Define the Many-to-One relationship to Permiso
  @ManyToOne(() => Role, (perm) => perm.schemaGraphs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
