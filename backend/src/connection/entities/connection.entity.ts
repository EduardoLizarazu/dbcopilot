import { Databasetype } from "src/databasetype/entities/databasetype.entity";
import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Connection {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;


    description?: string;

    @Column()
    dbName: string;

    @Column()
    dbHost: string;

    @Column()
    dbPort: number;

    @Column()
    dbUsername: string;

    @Column({ select: false })
    dbPassword?: string;
    
    // Connection only has one and only one database type
    @ManyToOne(() => Databasetype, (databasetype) => databasetype.connections)
    databasetype: Databasetype;
}

