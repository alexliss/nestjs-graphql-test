import { ObjectType } from "@nestjs/graphql";
import { Paginated } from "src/common/paginated.model";
import { TypeORMError } from "typeorm";
import { PostModel } from "./post.model";

@ObjectType()
export class PaginatedPostModel extends Paginated(PostModel) {
    constructor(posts: PostModel[], offset: number, totalCount: number) {
        super()
        if (!posts) return
        this.hasNextPage = posts.length === offset + 1
        this.nodes = posts.slice(0, offset)
        this.edges = []
        this.edges.push({
            node: this.nodes[0],
            cursor: Buffer.from(JSON.stringify(this.nodes[0])).toString('base64')
        },
        {
            node: this.nodes[this.nodes.length - 1],
            cursor: Buffer.from(JSON.stringify(this.nodes[this.nodes.length - 1])).toString('base64')
        })
        this.totalCount = totalCount
    }
}