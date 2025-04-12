import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SchemaColumnKeyColumn } from './schema_column_key_column.entity';

@Entity('schema_column_key')
export class SchemaColumnKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  type: string;

  @OneToMany(
    () => SchemaColumnKeyColumn,
    (schemaColumnKeyColumn) => schemaColumnKeyColumn.schemaColumKeys,
    { onDelete: 'CASCADE' },
  )
  schemaColumnKeyColumns: SchemaColumnKeyColumn[]; // Assuming you have a SchemaColumnKeyColumn entity defined elsewhere
}
