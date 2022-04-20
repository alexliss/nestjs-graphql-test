import faker from "@faker-js/faker"
import { CommentVote } from "src/content/comment/comment-vote.entity"
import { define } from "typeorm-seeding"

define(CommentVote, () => {
    const vote = new CommentVote()
    vote.vote = faker.random.arrayElement([1, -1])
    return vote
})