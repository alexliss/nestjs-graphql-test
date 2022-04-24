import { Field, GraphQLISODateTime, ID, ObjectType } from "@nestjs/graphql";
import { PaginatedCommentModel } from "src/content/comment/models/paginated-comment.model";
import { PaginatedPostModel } from "src/content/post/models/paginated-post.model";

@ObjectType()
export class UserModel {
    @Field(type => ID)
    id: string;

    @Field(type => String)
    username: string;

    @Field(type => String)
    email: string;

    @Field(type => PaginatedPostModel)
    posts: PaginatedPostModel

    @Field(type => PaginatedCommentModel)
    comments: PaginatedCommentModel

    @Field(type => GraphQLISODateTime)
    createdAt: Date
}