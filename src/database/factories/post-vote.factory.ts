import faker from "@faker-js/faker"
import { PostVote } from "src/content/post/post-vote.entity"
import { define } from "typeorm-seeding"

define(PostVote, () => {
    const vote = new PostVote()
    vote.vote = faker.random.arrayElement([1, -1])
    return vote
})