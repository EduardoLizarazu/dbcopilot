import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { SchemaColumnKey } from './schema_column_key.entity';
import { SchemaColumn } from './schema_column.entity';

@Entity('schema_column_key_column')
export class SchemaColumnKeyColumn {
  @Column({ primary: true })
  id_column_key: number;

  @PrimaryColumn({ primary: true })
  id_schema_column: number;

  @Column({ default: false })
  is_static: boolean;

  @ManyToOne(() => SchemaColumnKey, (schemaColumnKeys) => schemaColumnKeys.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_column_key' })
  schemaColumKeys: SchemaColumnKey;

  @ManyToOne(() => SchemaColumn, (schemaColumn) => schemaColumn.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_schema_column' })
  schemaColumn: SchemaColumn;
}
