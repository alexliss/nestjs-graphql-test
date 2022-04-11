import { InputType, OmitType } from "@nestjs/graphql";
import { UserRegisterInput } from "./user-register.input";

@InputType()
export class UserLoginInput extends OmitType(UserRegisterInput, ["username"] as const) {}