import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("column_key")
export class ColumnKey {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;
}