import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Content } from "../content";
import { Post } from "../post/post.entity";
import { CommentVote } from "./comment-vote.entity";

@Entity('comments')
export class Comment extends Content {

    @ManyToOne(() => User, user => user.comments)
    user: User

    @ManyToOne(() => Post, post => post.comments)
    post: Post

    @Column()
    text: string

    @Column()
    postId: string

    @Column({ nullable: true })
    parentId?: string

    @ManyToOne(type => Comment, comment => comment.children, { nullable: true })
    parent?: Comment;

    @OneToMany(type => Comment, comment => comment.parent, { nullable: true })
    children?: Comment[];

    @OneToMany(type => CommentVote, vote => vote.comment)
    votes: CommentVote[];
}