import { Post } from "src/content/post/post.entity";
import { User } from "src/user/user.entity";
import { getRepository } from "typeorm";
import { factory, Seeder } from "typeorm-seeding";

export default class PostSeed implements Seeder {
    public async run() {
        const users = await getRepository(User).find({
            select: ['id']
        })
        const posts = await factory(Post)().map(async post => {
            const randomIdx = Math.floor(Math.random() * users.length)
            post.userId = users[randomIdx].id
            return post
        }).createMany(1000)
    }
}