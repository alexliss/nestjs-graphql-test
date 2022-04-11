import { Field, ID, IntersectionType, ObjectType } from "@nestjs/graphql";
import { UserModel } from "./user.model";

@ObjectType()
export class LoginModel extends UserModel { 
    @Field(type => String)
    token: string
}