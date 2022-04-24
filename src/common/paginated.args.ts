import { ArgsType, Field } from "@nestjs/graphql";
import { IsBase64, IsNumber, IsOptional, IsPositive } from "class-validator";

@ArgsType()
export class PaginatedArgs {
    @Field({ nullable: true })
    @IsBase64()
    @IsOptional()
    lastCursor?: string

    @Field()
    @IsNumber()
    @IsPositive()
    offset: number
}