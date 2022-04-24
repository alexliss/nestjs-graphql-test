import { PostVote } from "src/content/post/post-vote.entity";
import { Post } from "src/content/post/post.entity";
import { User } from "src/user/user.entity"
import { getRepository } from "typeorm";
import { factory, Seeder } from "typeorm-seeding"

export default class PostVoteSeed implements Seeder {
    public async run() {
        const users = await getRepository(User).find({
            select: ['id']
        })
        const posts = await getRepository(Post).find({
            select: ['id']
        })
        const votes = await factory(PostVote)().map(async vote => {
            let randomIdx = Math.floor(Math.random() * users.length)
            vote.userId = users[randomIdx].id
            randomIdx = Math.floor(Math.random() * posts.length)
            vote.postId = posts[randomIdx].id
            return vote
        }).createMany(40000)
    }
}