import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { groupBy } from "rxjs";
import { User } from "src/user/user.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { CommentVote } from "./comment-vote.entity";
import { Comment } from "./comment.entity";
import { CreateCommentInput } from "./inputs/create-comment.input";
import { UpdateCommentInput } from "./inputs/update-comment.input";
import { CommentModel } from "./models/comment.model";

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment) private readonly commentRepo: Repository<Comment>,
        @InjectRepository(CommentVote) private readonly voteRepo: Repository<CommentVote>) { }

    async create(user: User, data: CreateCommentInput): Promise<CommentModel> {
        let comment = data as Comment
        comment.userId = user.id
        comment = await this.commentRepo.save(comment)
        const res = comment as unknown as CommentModel
        res.username = user.username
        res.rating = 0
        return res;
    }

    async getById(id: string): Promise<CommentModel> {
        return await this.commentRepo.createQueryBuilder("comments")
            .select([
                "posts.id AS id", 
                "posts.userId AS userId", 
                "posts.createdAt AS createdAt",
                "posts.deletedAt AS deletedAt",
                "posts.title AS title",
                "posts.text AS text"
            ])
            .where("id = :id", { id: id })
            .leftJoinAndSelect("SUM(commentVote.vote)", "rating", "commentId = :commentId", { commentId: id })
            .leftJoinAndSelect("user.username", "username")
            .orderBy("comments.createdAt", "DESC")
            .getRawOne<CommentModel>()
    }

    async getByPostId(postId: string, sortBy: "rating" | "date"): Promise<CommentModel[]> {
        let qb = this.commentRepo.createQueryBuilder("comments")
        .select([
            "comments.id AS id", 
            "comments.userId AS userId", 
            "comments.postId AS postId",
            "comments.createdAt AS createdAt",
            "comments.deletedAt AS deletedAt",
            "comments.text AS text"
        ])
        .addSelect('user.username', 'username')
        .addSelect('SUM(votes.vote)', 'rating')
        .leftJoin("comments.user", "user")
        .leftJoin("comments.votes", "votes")
        .where("comments.postId = :postId", { postId: postId })
        .groupBy("comments.id")
        .addGroupBy("user.username")

        switch (sortBy) {
            case "date":
                qb = qb.orderBy("comments.createdAt", "DESC")
                break
        
            case "rating": 
                qb = qb.orderBy("rating", "DESC") // order by 
                break
        }
        
        return (await qb.getRawMany<CommentModel>()).map(comment => {
            if (!comment.rating) comment.rating = 0
            return comment
        })
    }

    async vote(user: User, id: string, vote: -1 | 0 | 1): Promise<CommentModel> {
        const comment = await this.getById(id)
        if (vote == 0) {
            comment.rating -= await this.deleteVote(user.id, id)
        } else {
            const commentVote = { userId: user.id, commentId: id, vote: vote } as CommentVote
            await this.voteRepo.save(commentVote)
        }
        return comment
    }

    private async getRating(id: string): Promise<number> {
        const { rating } = await this.voteRepo
            .createQueryBuilder("commentVote")
            .select("SUM(commentVote.vote)", "rating")
            .where("commentVote.commentId = :commentId", { commentId: id })
            .getRawOne<{rating: number}>()
        
        return rating || 0;
    }

    async edit(id: string, data: UpdateCommentInput): Promise<CommentModel> {
        let comment = await this.commentRepo.findOneOrFail(id, {
            relations: ['user.username']
        })
        comment = this.commentRepo.merge(comment, data)
        await this.commentRepo.save(comment)
        const res = comment as unknown as CommentModel
        res.username = comment.user.username
        return res
    }

    async delete(id: string) {
        const comment = await this.commentRepo.findOneOrFail(id)
        await this.commentRepo.softDelete(id)
    }

    private async deleteVote(userId: string, commentId: string): Promise<number> {
        const vote = await this.voteRepo.findOne({
            where: {
                userId: userId,
                commentId: commentId
            }
        })
        if (vote) {
            await this.voteRepo.delete(vote)
            return vote.vote
        }
        return 0
    }
}