import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("column_table")
export class ColumnTable {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    technical_name: string

    @Column()
    alias_name: string

    @Column()
    column_type: string
}
