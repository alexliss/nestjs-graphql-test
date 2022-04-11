import { forwardRef, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/user/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(@Inject(forwardRef(() => UserService)) private readonly userService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET
        })
    }

    async validate(req: any) {
        console.log('aboba')
        const userId = req.payload.userId
        if (!userId)
            throw new UnauthorizedException()
        const user = await this.userService.repo.findOne({
            where: {
                id: userId
            }
        })
        if (!user) {
            throw new UnauthorizedException()
        }
        user.password = undefined
        return user;
    }
}