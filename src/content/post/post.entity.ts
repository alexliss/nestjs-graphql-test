import { User } from "src/user/user.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Comment } from "../comment/comment.entity";
import { Content } from "../content";
import { PostVote } from "./post-vote.entity";

@Entity('posts')
export class Post extends Content {

    @Column()
    title: string

    @Column()
    text: string

    @ManyToOne(() => User, user => user.posts)
    user: User

    @OneToMany(() => Comment, comment => comment.post, { nullable: true })
    comments: Comment[]

    @OneToMany(() => PostVote, vote => vote.post, { nullable: true })
    votes: PostVote[]

    @Column({ type: 'varchar', array: true, nullable: true, default: [] })
    tags?: string[]
}