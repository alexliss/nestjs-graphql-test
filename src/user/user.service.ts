import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { PaginatedArgs } from 'src/common/paginated.args';
import { Repository } from 'typeorm';
import { UserLoginInput } from './inputs/user-login.input';
import { UserRegisterInput } from './inputs/user-register.input';
import { UserUpdateInput } from './inputs/user-update.input';
import { LoginModel } from './models/login.model';
import { PaginatedUserModel } from './models/paginated-user.model';
import { UserModel } from './models/user.model';
import { User } from './user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly repo: Repository<User>,
        @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService) { }

    async register(data: UserRegisterInput) {
        let user = data as User
        try {
            user = await this.repo.save(user)
        } catch (e) {
            throw new BadRequestException(e)
        }
        const token = this.authService.getToken(user.id)

        return { id: user.id, username: user.username, token: token } as LoginModel
    }

    async getMany(paginationSettings: PaginatedArgs) {
        let qb = this.repo.createQueryBuilder('user')
            .select([
                "user.id AS id", 
                "user.email AS email",
                "user.username AS username"])

        if (paginationSettings.lastCursor) {
            let last = JSON.parse(Buffer.from(paginationSettings.lastCursor, 'base64').toString()) as unknown as UserModel
            qb = qb.where("user.id > :id", { id: last.id })
        }
        
        qb = qb.orderBy("user.id", "ASC").limit(paginationSettings.offset + 1)
        const raw = await qb.getRawMany<UserModel>()
        return new PaginatedUserModel(raw, paginationSettings.offset, await this.repo.count())  
    }

    async getById(id: string) {
        let user
        try {
            user = await this.repo.findOneOrFail({
                where: {
                    id: id
                }
            })
        } catch (e) {
            throw new NotFoundException(e)
        }

        return user as UserModel
    }

    async update(user: User, data: UserUpdateInput) {
        user = this.repo.merge(user, data)
        try {
            await this.repo.save(user)
        } catch(err) {
            throw new BadRequestException('email or username is already taken')
        }
        return {
            ...user,
            posts: undefined,
            comments: undefined
        } as UserModel
    }

    async delete(user: User) {
        try {
            await this.repo.softDelete(user)
        } catch(err) {
            throw new InternalServerErrorException(err)
        }
        return { status: "success" }
    }

    async getByUsername(username: string) {
        let user
        try {
            user = await this.repo.findOneOrFail({
                where: {
                    username: username
                }
            })
        } catch (e) {
            throw new NotFoundException(e)
        }

        return user as UserModel
    }

    async getByEmail(email: string) {
        return await this.repo.findOne({
            where: {
                email: email
            }
        })
    }

    async login(userData: UserLoginInput) {
        const user = await this.repo.findOne({
            where: {
                email: userData.email
            }
        })

        const token = this.authService.getToken(user.id)

        return { id: user.id, username: user.username, token: token } as LoginModel
    }
}
