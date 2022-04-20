import faker from '@faker-js/faker';
import { Comment } from 'src/content/comment/comment.entity';
import { define } from 'typeorm-seeding';

define(Comment, () => {
    const comment = new Comment()
    comment.text = faker.random.words(10)
    return comment
})