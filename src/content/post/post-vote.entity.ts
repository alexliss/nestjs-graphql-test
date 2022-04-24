import { User } from "src/user/user.entity";
import { Column, Entity, ManyToOne, PrimaryColumn, Unique } from "typeorm";
import { Post } from "./post.entity";

@Unique(["userId", "postId"])
@Entity("postVote")
export class PostVote {

    @PrimaryColumn()
    userId: string

    @PrimaryColumn()
    postId: string

    @Column("int")
    vote: number

    @ManyToOne(type => Post, { onDelete: "CASCADE" })
    post: Post

    @ManyToOne(type => User)
    user: User
}