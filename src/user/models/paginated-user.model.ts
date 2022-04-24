import { ObjectType } from "@nestjs/graphql";
import { Paginated } from "src/common/paginated.model";
import { UserModel } from "./user.model";

@ObjectType()
export class PaginatedUserModel extends Paginated(UserModel) {
    constructor(users: UserModel[], offset: number, totalCount: number) {
        super()
        this.hasNextPage = users.length === offset + 1
        this.nodes = users.slice(0, offset)
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