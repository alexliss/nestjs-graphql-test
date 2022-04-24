import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CurrentUser } from "src/auth/user.decorator";
import { User } from "src/user/user.entity";
import { UserPropertyGuard } from "../user-property.guard";
import { VoteArgs } from "../vote.args";
import { Comment } from "./comment.entity";
import { CommentService } from "./comment.service";
import { CreateCommentInput } from "./inputs/create-comment.input";
import { PaginatedCommentArgs } from "./inputs/paginated-post.args";
import { UpdateCommentInput } from "./inputs/update-comment.input";
import { CommentModel } from "./models/comment.model";

@Resolver(of => CommentModel)
export class CommentResolver {
    constructor(private readonly commentService: CommentService) { }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => CommentModel)
    async create(@CurrentUser() user: User, @Args('comment') comment: CreateCommentInput) {
        return this.commentService.create(user, comment)
    }

    @UseGuards(JwtAuthGuard, new UserPropertyGuard(Comment))
    @Mutation(returns => CommentModel)
    async edit(@Args('id') id: string, @Args('comment') comment: UpdateCommentInput) {
        return this.commentService.edit(id, comment)
    }

    @UseGuards(JwtAuthGuard, new UserPropertyGuard(Comment))
    @Mutation(returns => CommentModel)
    async delete(@Args('id') id: string) {
        return this.commentService.delete(id)
    }

    @Query(returns => [CommentModel])
    async getByPostId(@Args('postId') postId: string, @Args() args: PaginatedCommentArgs) {
        return this.commentService.getByPostId(postId, args)
    }

    @Query(returns => CommentModel)
    async getById(@Args('id') id: string) {
        return this.commentService.getById(id)
    }


    @UseGuards(JwtAuthGuard)
    @Mutation(retuns => CommentModel)
    async voteComment(@CurrentUser() user: User, @Args() args: VoteArgs) {
        return this.commentService.vote(user, args)
    }

}