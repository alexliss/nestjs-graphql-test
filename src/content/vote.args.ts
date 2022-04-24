import { ArgsType, Field, ID, Int } from "@nestjs/graphql";
import { IsIn, IsUUID } from "class-validator";

@ArgsType()
export class VoteArgs {
    @Field(type => ID)
    @IsUUID()
    id: string

    @Field(type => Int)
    @IsIn([ -1, 0, 1 ])
    vote: number
}