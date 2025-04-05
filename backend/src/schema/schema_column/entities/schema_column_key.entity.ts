import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("schema_column_key")
export class SchemaColumnKey {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    type: string;
}