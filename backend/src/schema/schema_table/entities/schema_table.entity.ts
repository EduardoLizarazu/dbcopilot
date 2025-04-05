import { Connection } from "src/connection/entities/connection.entity";
import { SchemaColumn } from "src/schema/schema_column/entities/schema_column.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("schema_table")
export class SchemaTable {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    technicalName: string;

    @Column({ nullable: true })
    alias: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => SchemaColumn, 
        (schemaColumn) => schemaColumn.schemaTable, { onDelete: "CASCADE" })
    schemaColumns: SchemaColumn[]; 

    @ManyToOne(() => Connection,
        (connection) => connection.schemaTables, { onDelete: "CASCADE" })
    connection: Connection;   
}
