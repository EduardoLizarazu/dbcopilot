import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Connection {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column()
    description?: string;

    @Column()
    dbType: string;

    @Column()
    dbName: string;

    @Column()
    dbHost: string;

    @Column()
    dbPort: number;

    @Column()
    dbUsername: string;

    @Column()
    dbPassword?: string;
}