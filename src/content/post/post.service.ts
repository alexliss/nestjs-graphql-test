import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/user.entity";
import { Repository } from "typeorm";
import { CreatePostInput } from "./inputs/create-post.input";
import { UpdatePostInput } from "./inputs/update-post.input";
import { PostModel } from "./models/post.model";
import { PostVote } from "./post-vote.entity";
import { Post } from "./post.entity";

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(Post) private readonly postRepo: Repository<Post>,
        @InjectRepository(PostVote) private readonly voteRepo: Repository<PostVote>
    ) { }

    async create(user: User, postData: CreatePostInput): Promise<PostModel> {
        let post = postData as Post
        post.user = user
        post = await this.postRepo.save(post);
        const result = post as unknown as PostModel
        result.username = user.username
        result.rating = 0
        return result
    }

    async getById(id: string): Promise<PostModel> { 
        const post = await this.postRepo.createQueryBuilder("posts")
        .select([
            "posts.id AS id", 
            "posts.userId AS userId", 
            "posts.createdAt AS createdAt",
            "posts.title AS title",
            "posts.text AS text"
        ])
        .addSelect('user.username', 'username')
        .addSelect('SUM(votes.vote)', 'rating')
        .leftJoin("posts.user", "user")
        .leftJoin("posts.votes", "votes")
        .where("posts.id = :postId", { postId: id })
        .groupBy("posts.id")
        .addGroupBy("user.username")
        .getRawOne<PostModel>()
        post.rating = +post.rating || 0;
        return post;
    }

    async getByUser(userId: string): Promise<PostModel[]> {
        const posts = await this.postRepo.createQueryBuilder("posts")
        .select([
            "posts.id AS id", 
            "posts.userId AS userId", 
            "posts.createdAt AS createdAt",
            "posts.deletedAt AS deletedAt",
            "posts.title AS title",
            "posts.text AS text"
        ])
        .addSelect('user.username', 'username')
        .addSelect('SUM(votes.vote)', 'rating')
        .leftJoin("posts.user", "user") 
        .leftJoin("posts.votes", "votes") 
        .where("user.id = :userId", { userId: userId }) 
        .groupBy("posts.id")
        .addGroupBy("user.username")
        .orderBy("posts.createdAt", "DESC")
        .getRawMany<PostModel>()
        return posts.map(post => {
            post.rating = +post.rating || 0
            return post
        })
    }

    async edit(id: string, data: UpdatePostInput): Promise<PostModel> {
        let post = await this.postRepo.findOneOrFail(id, {
            relations: ["user.username"]
        })
        post = this.postRepo.merge(post, data)
        await this.postRepo.save(post)
        const res = post as unknown as PostModel
        res.username = post.user.username
        res.rating = await this.getRating(id)
        return res
    }

    async delete(id: string) {
        const post = await this.postRepo.findOneOrFail(id)
        await this.postRepo.remove(post)
        return { status: "success" }
    }

    async getFeed(settings: "newest" | "hot" | "discussed"): Promise<PostModel[]> {
        const dayAgo = new Date(Date.now() - 86400)
        let qb = this.postRepo.createQueryBuilder('posts')
            .select([
                "posts.id AS id", 
                "posts.userId AS userId", 
                "posts.createdAt AS createdAt",
                "posts.deletedAt AS deletedAt",
                "posts.title AS title",
                "posts.text AS text"
            ])
            .addSelect("user.username", "username")
            .addSelect("SUM(votes.vote)", "rating")
            .addSelect("COUNT(comments)", "commentsCount")
            .leftJoin("posts.user", "user") 
            .leftJoin("posts.votes", "votes")
            .leftJoin("posts.comments", "comments")
            .groupBy("posts.id")
            .addGroupBy("user.username")

        switch (settings) {
            case "newest":
                qb = qb.orderBy("posts.createdAt", "DESC")
                break;
        
            case "hot":
                qb = qb.orderBy("rating", "DESC")
                break;

            case "discussed":
                qb = qb.orderBy("commentsCount", "DESC")
                break;
        }
        
        return (await qb.getRawMany<PostModel>()).map(post => {
            post.rating = +post.rating || 0
            return post
        })
    }

    async vote(user: User, id: string, vote: -1 | 0 | 1): Promise<PostModel> {
        const post = await this.getById(id)
        let postVote = await this.voteRepo.findOne({
            where: {
                userId: user.id,
                postId: id,
                vote: vote
            }
        })
        if (vote == 0) {
            post.rating -= await this.deleteVote(user.id, id)
        } else if (!postVote) {
            postVote = postVote || { userId: user.id, postId: post.id, vote: vote } as PostVote
            await this.voteRepo.save(postVote)
            post.rating += vote
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