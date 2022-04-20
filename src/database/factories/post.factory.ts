import faker from '@faker-js/faker';
import { Post } from 'src/content/post/post.entity';
import { define } from 'typeorm-seeding';

define(Post, () => {
    const post = new Post()
    post.title = faker.random.words(3),
    post.text = faker.random.words(20)
    return post
})