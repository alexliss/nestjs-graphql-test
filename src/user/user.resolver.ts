import { UseGuards, UseInterceptors } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { LocalAuthGuard } from "src/auth/local-auth.guard";
import { PasswordHashingInterceptor } from "src/auth/password-hash.interceptor";
import { CurrentUser } from "src/auth/user.decorator";
import { UserLoginInput } from "./inputs/user-login.input";
import { UserRegisterInput } from "./inputs/user-register.input";
import { UserUpdateInput } from "./inputs/user-update.input";
import { LoginModel } from "./models/login.model";
import { UserModel } from "./models/user.model";
import { User } from "./user.entity";
import { UserService } from "./user.service";

@Resolver(of => UserModel)
export class UserResolver {
    constructor(private readonly userService: UserService) { }

    @UseInterceptors(PasswordHashingInterceptor)
    @Mutation(returns => LoginModel)
    async register(@Args('userData') userData: UserRegisterInput) {
        return await this.userService.register(userData)
    }

    @UseGuards(LocalAuthGuard)
    @Mutation(returns => LoginModel)
    async login(@Args('userData') userData: UserLoginInput) {
        return await this.userService.login(userData)
    }

    @UseInterceptors(PasswordHashingInterceptor)
    @UseGuards(JwtAuthGuard)
    @Mutation(returns => UserModel)
    async update(@Args('userData') userData: UserUpdateInput, @CurrentUser() user: User) {
        return await this.userService.update(user, userData)
    }

    @UseGuards(JwtAuthGuard)
    @Query(returns => UserModel)
    async user(@Args('id', { type: () => String }) id: string): Promise<UserModel> {
        console.log(id)
        return await this.userService.getById(id)
    }

    @UseGuards(JwtAuthGuard)
    @Query(returns => UserModel)
    async me(@CurrentUser() user: User) {
        console.log(user)
        return await this.userService.getById(user.id)
    }

    @UseGuards(JwtAuthGuard)
    @Query(returns => [UserModel])
    async users() {
        return await this.userService.getAll()
    }
}