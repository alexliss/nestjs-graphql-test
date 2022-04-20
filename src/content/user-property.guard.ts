import { CanActivate, ExecutionContext, Type } from "@nestjs/common"
import { GqlExecutionContext } from "@nestjs/graphql";
import { getRepository } from "typeorm"
import { Content } from "./content"

export class UserPropertyGuard implements CanActivate {
    constructor(readonly type: Type<Content>) {}
    async canActivate(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        const propertyId = ctx.getArgs().id
        const userId = ctx.getContext().req.user.id;
        const property: Content = await getRepository(this.type).findOneOrFail(propertyId)
        if (property.userId === userId) {
            return true
        }
        return false
    }
  }