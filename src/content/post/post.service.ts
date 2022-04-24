import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginatedArgs } from "src/common/paginated.args";
import { User } from "src/user/user.entity";
import { MoreThanOrEqual, Repository } from "typeorm";
import { VoteArgs } from "../vote.args";
import { CreatePostInput } from "./inputs/create-post.input";
import { PaginatedPostArgs } from "./inputs/paginated-post.args";
import { UpdatePostInput } from "./inputs/update-post.input";
import { PaginatedPostModel } from "./models/paginated-post.model";
import { PostModel } from "./models/post.model";
import { PostVote } from "./post-vote.entity";
import { Post } from "./post.entity";

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(Post) private readonly postRepo: Repository<Post>,
        @InjectRepository(PostVote) private readonly voteRepo: Repository<PostVote>
    ) { }

    async create(user: User, data: CreatePostInput): Promise<PostModel> {
        data.tags = data.tags.map(tag => {
            return tag.toLowerCase().trim()
        })
        let post = { ...data } as Post
        post.user = user
        post = await this.postRepo.save(post);

        const result = post as unknown as PostModel
        result.username = user.username
        result.rating = 0
        result.commentsCount = 0
        return result
    }

    async getById(id: string): Promise<PostModel> { 
        const post = await this.postRepo.createQueryBuilder("post")
        .select([
            "post.id AS id", 
            "post.userId AS userId", 
            "post.createdAt AS createdAt",
            "post.title AS title",
            "post.text AS text",
            "post.tags AS tags"
        ])
        .addSelect('user.username', 'username')
        .addSelect('SUM(votes.vote)', 'rating')
        .addSelect('COUNT(comments)', 'commentsCount')
        .leftJoin("post.user", "user")
        .leftJoin("post.votes", "votes")
        .leftJoin("post.comments", "comments")
        .where("post.id = :postId", { postId: id })
        .groupBy("post.id")
        .addGroupBy("user.username")
        .getRawOne<PostModel>()
        post.rating = +post.rating || 0;
        return post;
    }

    async getByUser(id: string, data: PaginatedArgs): Promise<PaginatedPostModel> {
        let qb = this.postRepo.createQueryBuilder("posts")
        .select([
            "posts.id AS id", 
            "posts.userId AS userId", 
            "posts.createdAt AS createdAt",
            "posts.deletedAt AS deletedAt",
            "posts.title AS title",
            "posts.text AS text",
            "posts.tags AS tags"
        ])
        .addSelect('user.username', 'username')
        .addSelect('SUM(votes.vote)', 'rating')
        .addSelect('COUNT(comments)', 'commentsCount')
        .leftJoin("posts.user", "user") 
        .leftJoin("posts.votes", "votes") 
        .leftJoin("post.comments", "comments")
        .where("user.id = :userId", { userId: id }) 

        if (data.lastCursor) {
            let last = JSON.parse(Buffer.from(data.lastCursor, 'base64').toString()) as unknown as PostModel
            qb = qb.andWhere("posts.createdAt > :createdAt", { createdAt: last.createdAt })
        }
        
        qb = qb.groupBy("posts.id")
        .addGroupBy("user.username")
        .orderBy("posts.createdAt", "DESC")
        .limit(data.offset + 1)
        
        const raw = await qb.getRawMany<PostModel>()
        return new PaginatedPostModel(
            raw, 
            data.offset, 
            await this.postRepo.count({
                where: {
                    userId: id
                }
            })
        )
    }

    async edit(id: string, data: UpdatePostInput): Promise<PostModel> {
        let post = await this.postRepo.findOneOrFail(id, {
            relations: ["user.username"]
        })
        post = {
            ...post,
            ...data,
            tags: []
        }
        await this.postRepo.save(post)

        const res = post as unknown as PostModel
        res.username = post.user.username
        res.rating = await this.getRating(id)
        res.commentsCount = await this.voteRepo
            .createQueryBuilder("postVote")
            .select("SUM(postVote.vote)")
            .where("postVote.postId = :postId", { postId: id })
            .getRawOne<number>()
        return res
    }

    async delete(id: string) {
        const post = await this.postRepo.findOneOrFail(id)
        await this.postRepo.softDelete(post)
        return { status: "success" }
    }

    async getFeed(settings: PaginatedPostArgs): Promise<PaginatedPostModel> {
        const weekAgo = new Date(Date.now() - 604800)

        let qb = this.postRepo.createQueryBuilder('posts')
            .select([
                "posts.id AS id", 
                "posts.userId AS userId", 
                "posts.deletedAt AS deletedAt",
                "posts.title AS title",
                "posts.text AS text",
                "posts.tags AS tags",
            ])
            .addSelect("posts.createdAt", "createdAt")
            .addSelect("user.username", "username")
            .addSelect("SUM(votes.vote)", "rating")
            .addSelect("COUNT(comments)", "commentsCount")

            if (settings.lastCursor) {

                let last = JSON.parse(Buffer.from(settings.lastCursor, 'base64').toString()) as unknown as PostModel
                switch (settings.sortSetting) {
                    case "newest":
                        qb = qb.where("posts.createdAt < :createdAt", { createdAt: last.createdAt })
                        break;
                
                    case "hot":
                        qb = qb.having('SUM(votes.vote) < :rating', { rating: last.rating })
                        break;
        
                    case "discussed":
                        qb = qb.where("commentsCount < :commentsCount", { commentsCount: last.commentsCount })
                        break;
                }
            }

        qb = qb.leftJoin("posts.user", "user") 
            .leftJoin("posts.votes", "votes")
            .leftJoin("posts.comments", "comments")
            .groupBy("posts.id")
            .addGroupBy("user.username")

        switch (settings.sortSetting) {
            case "newest":
                qb = qb.orderBy("posts.createdAt", "DESC")
                break;
        
            case "hot":
                qb = qb.orderBy("rating", "DESC").addOrderBy("posts.createdAt", "DESC")
                break;

            case "discussed":
                qb = qb.orderBy("commentsCount", "DESC").addOrderBy("posts.createdAt", "DESC")
                break;
        }

        qb = qb.limit(settings.offset + 1)

        qb.printSql

        const raw = await qb.getRawMany<PostModel>()

        console.log(raw)
        
        return new PaginatedPostModel(
            raw, 
            settings.offset, 
            await this.postRepo.count({
                where: {
                    createdAt: MoreThanOrEqual(weekAgo)
                }
            }))
    }

    async vote(user: User, data: VoteArgs): Promise<PostModel> {
        const post = await this.getById(data.id)
        let postVote = await this.voteRepo.findOne({
            where: {
                userId: user.id,
                postId: data.id,
                vote: data.vote
            }
        })
        if (data.vote == 0) {
            post.rating -= await this.deleteVote(user.id, data.id)
        } else if (!postVote) {
            postVote = { userId: user.id, postId: post.id, vote: data.vote } as PostVote
            await this.voteRepo.save(postVote)
            post.rating += data.vote
        }
        return post
    }

    private async getRating(id: string): Promise<number> {
        const { rating } = await this.voteRepo
            .createQueryBuilder("postVote")
            .select("SUM(postVote.vote)", "rating")
            .where("postVote.postId = :postId", { postId: id })
            .getRawOne<{rating: number}>()
        
        return rating || 0;
    }

    private async deleteVote(userId: string, postId: string) {
        const vote = await this.voteRepo.findOne({
            where: {
                userId: userId,
                postId: postId
            }
        })
        if (vote) {
            await this.voteRepo.delete(vote)
            return vote.vote
        }
        return 0
    }
}