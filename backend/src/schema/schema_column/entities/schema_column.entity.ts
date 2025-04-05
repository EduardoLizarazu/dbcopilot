import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { SchemaColumnKey } from "./schema_column_key.entity";

@Entity("schema_column")
export class SchemaColumn {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    technicalName: string;

    @Column()
    alias: string;

    @Column()
    dataType: string;

    @ManyToMany(() => SchemaColumnKey)
    @JoinTable()
    schemaColumnKeys: SchemaColumnKey[];
}
