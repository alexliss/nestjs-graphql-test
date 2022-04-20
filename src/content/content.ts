import { Column, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn } from "typeorm";

export abstract class Content {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    userId: string

    @CreateDateColumn()
    createdAt: Date

    @DeleteDateColumn()
    deletedAt: Date

}