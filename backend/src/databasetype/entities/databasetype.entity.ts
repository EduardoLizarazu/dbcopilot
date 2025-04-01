import { Connection } from "src/connection/entities/connection.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Databasetype {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column({unique: true})
    type: string;

    @Column()
    query: string;

    @OneToMany(() => Connection, (connection) => connection.databasetype)
    connections: Connection[];
}
