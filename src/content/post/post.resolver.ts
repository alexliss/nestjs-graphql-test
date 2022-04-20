import { Inject, UseGuards } from "@nestjs/common";
import { Query, Args, Mutation, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CurrentUser } from "src/auth/user.decorator";
import { User } from "src/user/user.entity";
import { CommentService } from "../comment/comment.service";
import { UserPropertyGuard } from "../user-property.guard";
import { CreatePostInput } from "./inputs/create-post.input";
import { UpdatePostInput } from "./inputs/update-post.input";
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
        return await this.postService.create(user, post)
    }

    @UseGuards(JwtAuthGuard, new UserPropertyGuard(Post))
    @Mutation(returns => PostModel)
    async editPost(@Args('id') id: string, @Args('editedData') editedData: UpdatePostInput) {
        return await this.postService.edit(id, editedData)
    }

    @UseGuards(JwtAuthGuard, new UserPropertyGuard(Post))
    @Mutation(returns => String)
    async deletePost(@Args('id') id: string) {
        return await this.postService.delete(id)
    }

    @ResolveField()
    async comments(@Parent() post: PostModel) {
        return await this.commentService.getByPostId(post.id, "rating")
    }

    @Query(returns => [PostModel])
    async feed(@Args('settings') settings: "hot" | "newest" | "discussed") {
        return await this.postService.getFeed(settings)
    }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => PostModel)
    async votePost(@CurrentUser() user: User, @Args('id') id: string, @Args('vote') vote: 1 | 0 | -1) {
        return await this.postService.vote(user, id, vote)
    }
    
}