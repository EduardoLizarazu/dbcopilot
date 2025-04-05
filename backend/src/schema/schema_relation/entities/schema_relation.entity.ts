import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("schema_relation")
export class SchemaRelation {
    @PrimaryColumn()
    columnIdFather: number;

    @PrimaryColumn()
    columnIdChild: number;

    @Column({ nullable: true })
    description: string;
}
