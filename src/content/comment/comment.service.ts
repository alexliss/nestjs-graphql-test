import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/user.entity";
import { Repository } from "typeorm";
import { VoteArgs } from "../vote.args";
import { CommentVote } from "./comment-vote.entity";
import { Comment } from "./comment.entity";
import { CreateCommentInput } from "./inputs/create-comment.input";
import { PaginatedCommentArgs } from "./inputs/paginated-post.args";
import { UpdateCommentInput } from "./inputs/update-comment.input";
import { CommentModel } from "./models/comment.model";
import { PaginatedCommentModel } from "./models/paginated-comment.model";

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
        const comment = await this.commentRepo.createQueryBuilder("comment")
            .select([
                "comment.id AS id", 
                "comment.userId AS userId", 
                "comment.deletedAt AS deletedAt",
                "comment.title AS title",
                "comment.text AS text"
            ])
            .addSelect("comment.createdAt AS createdAt")
            .where("id = :id", { id: id })
            .leftJoinAndSelect("SUM(commentVote.vote)", "rating", "commentId = :commentId", { commentId: id })
            .leftJoinAndSelect("user.username", "username")
            .orderBy("comment.createdAt", "DESC")
            .getRawOne<CommentModel>()

        comment.rating = +comment.rating
        return comment
    }

    async getByPostId(id: string, settings: PaginatedCommentArgs): Promise<PaginatedCommentModel> {
        let qb = this.commentRepo.createQueryBuilder("comment")
        .select([
            "comment.id AS id", 
            "comment.userId AS userId", 
            "comment.postId AS postId",
            "comment.deletedAt AS deletedAt",
            "comment.text AS text"
        ])
        .addSelect("comment.createdAt", "createdAt")
        .addSelect('user.username', 'username')
        .addSelect('SUM(votes.vote)', 'rating')
        .leftJoin("comment.user", "user")
        .leftJoin("comment.votes", "votes")
        .where("comment.postId = :postId", { postId: id })

        if (settings.lastCursor) {
            let last = JSON.parse(Buffer.from(settings.lastCursor, 'base64').toString()) as unknown as CommentModel
            switch (settings.sortSetting) {
                case "date":
                qb = qb.andWhere("comment.createdAt < :createdAt", { createdAt: last.createdAt })
                break
        
            case "rating": 
                    qb = qb.andWhere("comment.rating < :rating", { rating: last.rating })
                break
            }
        }

        qb = qb.groupBy("comment.id")
            .addGroupBy("user.username")
            .orderBy("comment.createdAt", "DESC")

        if (settings.sortSetting == "rating") {
            qb = qb.orderBy("rating", "DESC")
                .addOrderBy("comment.createdAt", "DESC") 
        }
        
        const raw = await qb.getRawMany<CommentModel>()

        return new PaginatedCommentModel(
            raw, 
            settings.offset,
            await this.commentRepo.count({
                where: {
                    postId: id
                }
            }))
    }

    async vote(user: User, data: VoteArgs): Promise<CommentModel> {
        const comment = await this.getById(data.id)
        if (data.vote == 0) {
            comment.rating -= await this.deleteVote(user.id, data.id)
        } else {
            const commentVote = { userId: user.id, commentId: data.id, vote: data.vote } as CommentVote
            await this.voteRepo.save(commentVote)
            comment.rating += data.vote
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
        res.rating = await this.getRating(id)
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