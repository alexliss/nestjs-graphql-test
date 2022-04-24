import { Comment } from "src/content/comment/comment.entity";
import { Post } from "src/content/post/post.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @OneToMany(() => Post, post => post.user)
    posts: Post[]

    @OneToMany(() => Comment, comment => comment.user)
    comments: Comment[]

    @CreateDateColumn()
    createdAt: Date

    @DeleteDateColumn()
    deletedAt: Date
}
