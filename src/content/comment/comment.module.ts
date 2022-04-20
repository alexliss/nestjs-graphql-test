import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommentVote } from "./comment-vote.entity";
import { Comment } from "./comment.entity";
import { CommentResolver } from "./comment.resolver";
import { CommentService } from "./comment.service";

@Module({
    imports: [
      TypeOrmModule.forFeature([Comment, CommentVote])
    ],
    providers: [CommentService, CommentResolver],
    exports: [CommentService]
})
export class CommentModule { }