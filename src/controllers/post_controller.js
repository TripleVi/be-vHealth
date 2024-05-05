import Post from '../models/post.js';
import Coordinate from '../models/coordinate.js';
import Record from '../models/activity_record.js';
import Photo from '../models/photo.js';
import PostRepo from '../data/repositories/post_repo.js';
import StorageService from '../services/storage_service.js'
import UserRepo from '../data/repositories/user_repo.js';
import Comment from '../models/comment.js';
import WorkoutData from '../models/workout_data.js';

class PostController {
    async fetchPosts(req, res) {
        try {
            const uid = req.headers.uid
            const repo = new PostRepo()
            const posts = await repo.getPosts(uid)
            res.send(posts)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }

    async createPost(req, res) {
        try {
            const uid = req.headers.uid
            const json = req.body
            console.log(Buffer.byteLength(JSON.stringify(json)))
            const userRepo = new UserRepo()
            const flag = await userRepo.userExists(uid)
            if(!flag) {
                return res.status(400).send({
                    message: 'No user exists',
                })
            }
            const post = Post.fromJson(json)
            post.record = Record.fromJson(json.record)
            post.record.coordinates = json.record.coordinates.map(Coordinate.fromJson)
            post.record.data = WorkoutData.fromJson(json.record.data)
            
            const repo = new PostRepo()
            const createdPost = await repo.createPost(post, uid)
            res.status(201).send(createdPost)
            
            // Fan-out write
            repo.createConnections(uid, createdPost.pid)
            // const service = new FeedService()
            // const result = await service.feedPublishing(uid, createdPost)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }

    async uploadPostFiles(req, res) {
        const postId = req.params.id
        const username = req.headers.username
        const mapFile = req.files.mapImg[0]
        const photoFiles = req.files.photos
        const service = new StorageService()
        let photos = []
        if(photoFiles != undefined) {
            const coordinates = JSON.parse(req.body.coordinates)
            console.log(coordinates)
            const photoUrls = []
            for (const file of photoFiles) {
                const photoUrl = await service.upload({ file, username, postId })
                photoUrls.push(photoUrl)
            }
            photos = coordinates.points.map((c, i) => 
                    Photo.generate(c.latitude, c.longitude, photoUrls[i]));
        }
        console.log(photos)
        const mapUrl = await service.upload({ file: mapFile, username, postId })
        const repo = new PostRepo()
        await repo.createPostFiles({ postId, photos, mapUrl })

        // try {
        //     const createdPost = await repo.createPost(post)
        //     res.send(createdPost)
        // } catch (error) {
        //     console.log(error)
        //     res.sendStatus(500)
        // }


        // res.writeHead(200, {
        //     "Content-Type": "application/json"
        // });
        // for (const piece of body) {
        //     setTimeout(() => {
        //         res.write(piece, "ascii");
        //     }, 3000)
        // }
        // setTimeout(() => {
                
        //     res.end('cc');
        //     }, 15000)
        // res.setHeader("Content-Type", "application/json")
        res.status(201).send({message: "hello world"})
    }

    async deletePost(req, res) {
        // check authorization
        try {
            const uid = req.headers.uid
            const postId = req.params.id
            const repo = new PostRepo()
            const flag = await repo.postExists(postId, uid)
            if(flag) {
                await repo.deletePost(postId, uid)
                return res.sendStatus(204)
            }
            res.status(400).send({
                message: 'No post exists',
            })
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }

    async countPostLikes(req, res) {
        try {
            const uid = req.headers.uid
            const postId = req.params.id
            const repo = new PostRepo()
            const data = await repo.countPostLikes(postId, uid)
            res.send(data)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }

    async likePost(req, res) {
        try {
            const uid = req.headers.uid
            const postId = req.params.id
            const repo = new PostRepo()
            const result = await repo.createPostLike(postId, uid)
            res.sendStatus(result == undefined ? 200 : 201)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }

    async unlikePost(req, res) {
        try {
            const uid = req.headers.uid
            const postId = req.params.id
            const repo = new PostRepo()
            const result = await repo.deletePostLike(postId, uid)
            res.sendStatus(result == undefined ? 200 : 201)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }

    async fetchUserReactions(req, res) {
        try {
            const uid = req.headers.uid
            const postId = req.params.id
            const repo = new PostRepo()
            const reactions = await repo.getUserReactions(uid, postId)
            res.send(reactions)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }

    async countComments(req, res) {
        try {
            const postId = req.params.id
            const path = req.query.path
            const repo = new PostRepo()
            const comments = await repo.countComments(postId, path)
            res.send({ comments })
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }

    async fetchComments(req, res) {
        try {
            const postId = req.params.id
            const path = req.query.path
            const lessThanDate = req.query.lessThanDate
            const repo = new PostRepo()
            let comments
            if(path == undefined) {
                comments = await repo.getIndependentComments(postId, lessThanDate)
            }else {
                comments = await repo.getDependentComments({
                    postId, path, lessThanDate,
                })
            }
            res.send(comments)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }

    async createComment(req, res) {
        try {
            const uid = req.headers.uid
            const postId = req.params.id
            const json = req.body
            const comment = Comment.fromJson(json)
            if(json.replyTo != undefined) {
                comment.replyTo = Comment.fromJson(json.replyTo)
            }
            const repo = new PostRepo()
            const createdComment = await repo.createComment({
                comment, postId, uid
            })
            res.status(201).send(createdComment)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }

    async deleteComment(req, res) {
        try {
            const uid = req.headers.uid
            const commentId = req.params.id
            const repo = new PostRepo()
            const result = await repo.deleteComment({ commentId, uid })
            res.sendStatus(result == undefined ? 200 : 201)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }

    async fetchPostDetails(req, res) {
        try {
            const postId = req.params.id
            const repo = new PostRepo()
            const flag = await repo.postExists(postId);
            if(!flag) {
                return res.status(404).send({
                    message: 'No post exists.',
                })
            }
            const data = await repo.getPostDetails(postId)
            res.send(data)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }
}

export default new PostController()