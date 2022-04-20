import { ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";

export class LocalAuthGuard extends AuthGuard('local') {
    getRequest(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        const gqlReq = ctx.getContext().req;
        if (gqlReq) {
            const variables = JSON.parse(JSON.stringify(ctx.getArgs().userData))
            gqlReq.body = variables;
            return gqlReq;
        }
        return context.switchToHttp().getRequest();
    }
}