import { Inject, ParseUUIDPipe, UseGuards } from "@nestjs/common";
import { Query, Args, Mutation, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CurrentUser } from "src/auth/user.decorator";
import { User } from "src/user/user.entity";
import { CommentService } from "../comment/comment.service";
import { UserPropertyGuard } from "../user-property.guard";
import { VoteArgs } from "../vote.args";
import { CreatePostInput } from "./inputs/create-post.input";
import { PaginatedPostArgs } from "./inputs/paginated-post.args";
import { UpdatePostInput } from "./inputs/update-post.input";
import { PaginatedPostModel } from "./models/paginated-post.model";
import { PostModel } from "./models/post.model";
import { Post } from "./post.entity";
import { PostService } from "./post.service";

@Resolver(of => PostModel)
export class PostResolver {
    constructor(
        private readonly postService: PostService,
        @Inject(CommentService) private readonly commentService: CommentService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => PostModel)
    async newPost(@Args('post') post: CreatePostInput, @CurrentUser() user: User) {
        return this.postService.create(user, post)
    }

    @UseGuards(JwtAuthGuard, new UserPropertyGuard(Post))
    @Mutation(returns => PostModel)
    async editPost(@Args('id') id: string, @Args('editedData') editedData: UpdatePostInput) {
        return this.postService.edit(id, editedData)
    }

    @UseGuards(JwtAuthGuard, new UserPropertyGuard(Post))
    @Mutation(returns => String)
    async deletePost(@Args('id') id: string) {
        return this.postService.delete(id)
    }

    @ResolveField()
    async comments(@Parent() post: PostModel) {
        return this.commentService.getByPostId(post.id, { sortSetting: "rating", offset: 50})
    }

    @Query(returns => PaginatedPostModel)
    async feed(@Args() args: PaginatedPostArgs) {
        return this.postService.getFeed(args)
    }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => PostModel)
    async votePost(@CurrentUser() user: User, @Args() data: VoteArgs) {
        return this.postService.vote(user, data)
    }

    @Query(returns => PaginatedPostModel)
    async userPosts(@Args('id', new ParseUUIDPipe) id: string, @Args() paginationSettings: PaginatedPostArgs) {
        return this.postService.getByUser(id, paginationSettings)
    }

    @Query(returns => PostModel)
    async post(@Args('id', new ParseUUIDPipe) id: string) {
        return this.postService.getById(id)
    }
    
}