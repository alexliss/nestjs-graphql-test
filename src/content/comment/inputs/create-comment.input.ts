import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class CreateCommentInput {

    @Field(type => ID)
    postId: string

    @Field()
    text: string
    
    @Field()
    parentId: string
}