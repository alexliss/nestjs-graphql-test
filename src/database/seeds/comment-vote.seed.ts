import { CommentVote } from "src/content/comment/comment-vote.entity"
import { Comment } from "src/content/comment/comment.entity"
import { User } from "src/user/user.entity"
import { getRepository } from "typeorm"
import { factory, Seeder } from "typeorm-seeding"

export default class CommentVoteSeed implements Seeder {
    public async run() {
        const users = await getRepository(User).find({
            select: ['id']
        })
        const comments = await getRepository(Comment).find({
            select: ['id']
        })
        const votes = await factory(CommentVote)().map(async vote => {
            let randomIdx = Math.floor(Math.random() * users.length)
            vote.userId = users[randomIdx].id
            randomIdx = Math.floor(Math.random() * comments.length)
            vote.commentId = comments[randomIdx].id
            return vote
        }).createMany(400000)

    }
}