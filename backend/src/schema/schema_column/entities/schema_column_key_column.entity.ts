import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { SchemaColumnKey } from './schema_column_key.entity';
import { SchemaColumn } from './schema_column.entity';

@Entity('schema_column_key_column')
export class SchemaColumnKeyColumn {
  @PrimaryColumn()
  id_column_key: number;

  @PrimaryColumn()
  id_schema_column: number;

  @Column({ default: false })
  is_static: boolean;

  @ManyToOne(() => SchemaColumnKey, (schemaColumnKeys) => schemaColumnKeys.id, {
    onDelete: 'CASCADE',
  })
  schemaColumKeys: SchemaColumnKey;

  @ManyToOne(() => SchemaColumn, (schemaColumn) => schemaColumn.id, {
    onDelete: 'CASCADE',
  })
  schemaColumn: SchemaColumn;
}
