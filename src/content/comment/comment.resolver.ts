import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CurrentUser } from "src/auth/user.decorator";
import { User } from "src/user/user.entity";
import { UserPropertyGuard } from "../user-property.guard";
import { Comment } from "./comment.entity";
import { CommentService } from "./comment.service";
import { CreateCommentInput } from "./inputs/create-comment.input";
import { UpdateCommentInput } from "./inputs/update-comment.input";
import { CommentModel } from "./models/comment.model";

@Resolver(of => CommentModel)
export class CommentResolver {
    constructor(private readonly commentService: CommentService) { }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => CommentModel)
    async create(@CurrentUser() user: User, @Args('comment') comment: CreateCommentInput) {
        return await this.commentService.create(user, comment)
    }

    @UseGuards(JwtAuthGuard, new UserPropertyGuard(Comment))
    @Mutation(returns => CommentModel)
    async edit(@Args('id') id: string, @Args('comment') comment: UpdateCommentInput) {
        return await this.commentService.edit(id, comment)
    }

    @UseGuards(JwtAuthGuard, new UserPropertyGuard(Comment))
    @Mutation(returns => CommentModel)
    async delete(@Args('id') id: string) {
        return await this.commentService.delete(id)
    }

    @Query(returns => [CommentModel])
    async getByPostId(@Args('postId') postId: string, @Args('sort') sort: 'rating' | 'date') {
        return await this.commentService.getByPostId(postId, sort)
    }

    @Query(returns => CommentModel)
    async getById(@Args('id') id: string) {
        return await this.commentService.getById(id)
    }


    @UseGuards(JwtAuthGuard)
    @Mutation(retuns => CommentModel)
    async voteComment(@Args('id') id: string, @Args('vote') vote: 1 | 0 | -1, @CurrentUser() user: User) {
        return await this.commentService.vote(user, id, vote)
    }

}