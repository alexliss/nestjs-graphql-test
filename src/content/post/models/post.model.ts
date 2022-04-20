import { Field, GraphQLISODateTime, ID, Int, ObjectType } from "@nestjs/graphql";
import { CommentModel } from "src/content/comment/models/comment.model";

@ObjectType()
export class PostModel {
    @Field(type => ID)
    id: string

    @Field(type => ID)
    userId: string

    @Field(type => String)
    username: string

    @Field(type => GraphQLISODateTime)
    createdAt: Date

    @Field(type => Int)
    rating: number = 0

    @Field(type => String)
    title: string

    @Field(type => String, { nullable: true })
    text?: string

    @Field(type => [CommentModel], { nullable: true })
    comments?: CommentModel
}