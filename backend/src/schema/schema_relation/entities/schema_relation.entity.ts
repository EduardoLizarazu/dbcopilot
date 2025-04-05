import { SchemaColumn } from "src/schema/schema_column/entities/schema_column.entity";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("schema_relation")
export class SchemaRelation {
    @PrimaryColumn()
    columnIdFather: number;

    @PrimaryColumn()
    columnIdChild: number;

    @Column()
    description: string;
}
