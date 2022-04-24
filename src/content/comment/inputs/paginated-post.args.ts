import { ArgsType, Field } from "@nestjs/graphql";
import { IsIn, IsString } from "class-validator";
import { PaginatedArgs } from "src/common/paginated.args";

@ArgsType()
export class PaginatedCommentArgs extends PaginatedArgs {
    @Field()
    @IsString()
    @IsIn(["rating", "date"])
    sortSetting: string
}