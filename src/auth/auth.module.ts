import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "src/user/user.module";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { LocalStrategy } from "./local.strategy";

@Module({
    providers: [JwtStrategy, LocalStrategy, AuthService],
    imports: [
        PassportModule, 
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: process.env.JWT_EXPIRE }}),
        forwardRef(() => UserModule),
    ],
    exports: [AuthService, LocalStrategy, JwtStrategy, PassportModule]
})
export class AuthModule { }