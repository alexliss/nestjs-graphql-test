import { Comment } from "src/content/comment/comment.entity"
import { Post } from "src/content/post/post.entity"
import { User } from "src/user/user.entity"
import { getRepository } from "typeorm"
import { factory, Seeder } from "typeorm-seeding"

export default class CommentSeed implements Seeder {
    public async run() {
        const users = await getRepository(User).find({
            select: ['id']
        })
        const posts = await getRepository(Post).find({
            select: ['id']
        })
        const comments = await factory(Comment)().map(async comment => {
            let randomIdx = Math.floor(Math.random() * users.length)
            comment.userId = users[randomIdx].id
            randomIdx = Math.floor(Math.random() * posts.length)
            comment.postId = posts[randomIdx].id
            return comment
        }).createMany(10000)
    }
}