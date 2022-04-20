import { Field, GraphQLISODateTime, ID, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class CommentModel {
    @Field(type => ID)
    id: string

    @Field(type => ID)
    userId: string
    
    @Field()
    username: string

    @Field(type => ID)
    postId: string

    @Field(type => ID)
    parentId: string
    
    @Field(type => GraphQLISODateTime)
    createdAt: Date

    @Field()
    text: string

    @Field(type => Int)
    rating: number
}