import { Field, InputType } from "@nestjs/graphql";
import { IsAlphanumeric, IsDefined, IsEmail, IsString, Length } from "class-validator";

@InputType()
export class UserRegisterInput {
    @Field()
    @IsString()
    @Length(8, 16)
    @IsAlphanumeric()
    username: string

    @Field()
    @IsEmail()
    email: string

    @Field()
    @IsString()
    password: string
}