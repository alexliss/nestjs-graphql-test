import { UseGuards, UseInterceptors } from "@nestjs/common";
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { LocalAuthGuard } from "src/auth/local-auth.guard";
import { PasswordHashingInterceptor } from "src/auth/password-hash.interceptor";
import { CurrentUser } from "src/auth/user.decorator";
import { PaginatedArgs } from "src/common/paginated.args";
import { UserLoginInput } from "./inputs/user-login.input";
import { UserRegisterInput } from "./inputs/user-register.input";
import { UserUpdateInput } from "./inputs/user-update.input";
import { LoginModel } from "./models/login.model";
import { PaginatedUserModel } from "./models/paginated-user.model";
import { UserModel } from "./models/user.model";
import { User } from "./user.entity";
import { UserService } from "./user.service";

@Resolver(of => UserModel)
export class UserResolver {
    constructor(private readonly userService: UserService) { }

    @UseInterceptors(PasswordHashingInterceptor)
    @Mutation(returns => LoginModel)
    async register(@Args('userData') userData: UserRegisterInput) {
        return this.userService.register(userData)
    }

    @UseGuards(LocalAuthGuard)
    @Mutation(returns => LoginModel)
    async login(@Args('userData') userData: UserLoginInput) {
        return this.userService.login(userData)
    }

    @UseInterceptors(PasswordHashingInterceptor)
    @UseGuards(JwtAuthGuard)
    @Mutation(returns => UserModel)
    async update(@Args('userData') userData: UserUpdateInput, @CurrentUser() user: User) {
        return this.userService.update(user, userData)
    }

    @UseGuards(JwtAuthGuard)
    @Query(returns => UserModel)
    async user(@Args('id', { type: () => String }) id: string): Promise<UserModel> {
        return this.userService.getById(id)
    }

    @UseGuards(JwtAuthGuard)
    @Query(returns => UserModel)
    async me(@CurrentUser() user: User) {
        return this.userService.getById(user.id)
    }

    @Query(returns => PaginatedUserModel)
    async users(@Args() args: PaginatedArgs) {
        return this.userService.getMany(args)
    }

    @ResolveField()
    async posts(@Parent() user: User) {
        
    }

    @ResolveField()
    async comments(@Parent() user: User) {
        
    }
}