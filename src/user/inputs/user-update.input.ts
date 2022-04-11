import { InputType, PartialType } from "@nestjs/graphql";
import { UserRegisterInput } from "./user-register.input";

@InputType()
export class UserUpdateInput extends PartialType(UserRegisterInput) { }