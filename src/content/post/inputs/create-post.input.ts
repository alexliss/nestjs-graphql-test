import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreatePostInput {

    @Field(type => String)
    title: string

    @Field(type => String, { nullable: true })
    text?: string

    @Field(type => [String], { nullable: true })
    tags?: string[]
}