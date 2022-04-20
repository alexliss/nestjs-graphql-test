import { User } from "src/user/user.entity"
import { Column, Entity, ManyToOne, PrimaryColumn, Unique } from "typeorm"
import { Comment } from "./comment.entity"

@Unique(["userId", "commentId"])
@Entity("commentVote")
export class CommentVote {

    @PrimaryColumn()
    userId: string

    @PrimaryColumn()
    commentId: string

    @Column("int")
    vote: number

    @ManyToOne(type => Comment, comment => comment.votes)
    comment: Comment

    @ManyToOne(type => User)
    user: User
}