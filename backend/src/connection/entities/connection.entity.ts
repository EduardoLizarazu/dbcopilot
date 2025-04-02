import { Databasetype } from "src/databasetype/entities/databasetype.entity";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Connection {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column()
    description?: string;

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
    
    // Connection only has one and only one database type
    @OneToMany(() => Databasetype, (databasetype) => databasetype.id)
    databasetype: Databasetype;
}