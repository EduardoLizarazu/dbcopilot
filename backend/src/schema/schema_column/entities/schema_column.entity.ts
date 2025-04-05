import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SchemaColumnKey } from "./schema_column_key.entity";
import { SchemaTable } from "src/schema/schema_table/entities/schema_table.entity";
import { SchemaRelation } from "src/schema/schema_relation/entities/schema_relation.entity";

@Entity("schema_column")
export class SchemaColumn {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    technicalName: string;

    @Column({  nullable: true })
    alias: string;

    @Column()
    dataType: string;

    @ManyToMany(() => SchemaColumnKey)
    @JoinTable()
    schemaColumnKeys: SchemaColumnKey[];

    @ManyToOne(() => SchemaTable, 
        (schemaTable) => schemaTable.schemaColumns, { onDelete: "CASCADE" })
    schemaTable: SchemaTable; // Assuming you have a SchemaTable entity defined elsewhere

    @OneToOne(() => SchemaRelation,
        (schemaRelation) => schemaRelation.columnIdFather, { onDelete: "CASCADE" })
    @JoinTable()
    schemaRelationFather: SchemaRelation; 

    @OneToOne(() => SchemaRelation,
        (schemaRelation) => schemaRelation.columnIdChild, { onDelete: "CASCADE" })
    @JoinTable()
    schemaRelationChild: SchemaRelation; 
}
