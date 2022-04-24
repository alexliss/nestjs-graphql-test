import { ArgsType, Field } from "@nestjs/graphql";
import { IsIn, IsString } from "class-validator";
import { PaginatedArgs } from "src/common/paginated.args";

@ArgsType()
export class PaginatedPostArgs extends PaginatedArgs {
    @Field()
    @IsString()
    @IsIn(["hot", "newest", "discussed"])
    sortSetting: string
}