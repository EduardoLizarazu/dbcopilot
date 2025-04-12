import { SchemaColumn } from 'src/schema/schema_column/entities/schema_column.entity';
import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';

@Entity('schema_relation')
export class SchemaRelation {
  @PrimaryColumn()
  columnIdFather: number;

  @PrimaryColumn()
  columnIdChild: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  isStatic: string;

  // columnIdFather is also the foreign key to the SchemaColumn table
  @OneToOne(
    () => SchemaColumn,
    (schemaColumn) => schemaColumn.schemaRelationFather,
    {
      onDelete: 'CASCADE',
    },
  )
  columnIdFatherRelation: SchemaColumn;

  // columnIdChild is also the foreign key to the SchemaColumn table
  @OneToOne(
    () => SchemaColumn,
    (schemaColumn) => schemaColumn.schemaRelationChild,
    {
      onDelete: 'CASCADE',
    },
  )
  columnIdChildRelation: SchemaColumn;
}
