import { forwardRef, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { UserService } from "src/user/user.service";
import * as argon2 from "argon2";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(forwardRef(() => UserService)) private readonly userService: UserService) {
    super({ usernameField: "email" });
}

  async validate(email: string, password: string): Promise<any> {
    const user = await this.userService.getByEmail(email);
    if (!user) throw new UnauthorizedException();

    const isValid = await argon2.verify(user.password, password);

    if (!isValid) throw new UnauthorizedException();

    return user;
  }
}