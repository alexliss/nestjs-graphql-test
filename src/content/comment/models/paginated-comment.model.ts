import { ObjectType } from "@nestjs/graphql"
import { Paginated } from "src/common/paginated.model"
import { CommentModel } from "./comment.model"

@ObjectType()
export class PaginatedCommentModel extends Paginated(CommentModel) {
    constructor(comments: CommentModel[], offset: number, totalCount: number) {
        super()
        this.hasNextPage = comments.length === offset + 1
        this.nodes = comments.slice(0, offset)
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