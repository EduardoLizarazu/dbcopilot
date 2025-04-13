import { SchemaColumn } from 'src/schema/schema_column/entities/schema_column.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity('schema_relation')
export class SchemaRelation {
  @Column({ primary: true })
  columnIdFather: number;

  @Column({ primary: true })
  columnIdChild: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  isStatic: boolean;

  // columnIdFather is also the foreign key to the SchemaColumn table
  @ManyToOne(
    () => SchemaColumn,
    (schemaColumn) => schemaColumn.schemaRelationFather,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'columnIdFather' })
  columnIdFatherRelation: SchemaColumn;

  // columnIdChild is also the foreign key to the SchemaColumn table
  @ManyToOne(
    () => SchemaColumn,
    (schemaColumn) => schemaColumn.schemaRelationChild,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'columnIdChild' })
  columnIdChildRelation: SchemaColumn;
}
