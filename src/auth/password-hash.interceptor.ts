import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { isString, length } from "class-validator"
import { Observable } from "rxjs"
import * as argon2 from "argon2";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class PasswordHashingInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const ctx = GqlExecutionContext.create(context);
    let password = ctx.getArgs().userData.password
    if (!password) {
      throw new BadRequestException('password is undefined')
    }
    const isPasswordCorrect = isString(password) && length(password, 8, 16)
    if(!isPasswordCorrect) {
      throw new BadRequestException('password must be string 8 to 16 symbols')
    }
    password = await argon2.hash(password)
    ctx.getArgs().userData.password = password
    return next.handle();
  }
}