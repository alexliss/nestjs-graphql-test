import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommentModule } from "../comment/comment.module";
import { PostVote } from "./post-vote.entity";
import { Post } from "./post.entity";
import { PostResolver } from "./post.resolver";
import { PostService } from "./post.service";

@Module({
    imports: [
      TypeOrmModule.forFeature([Post, PostVote]),
      CommentModule
    ],
    providers: [PostService, PostResolver],
    exports: [PostService]
})
export class PostModule { }