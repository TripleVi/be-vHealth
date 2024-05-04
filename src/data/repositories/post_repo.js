import Neo4jService from "../neo4j/neo4j_service.js";
import Post from "../../models/post.js";
import Comment from "../../models/comment.js";
import ActivityRecord from "../../models/activity_record.js";
import Photo from "../../models/photo.js";
import Coordinate from "../../models/coordinate.js";
import WorkoutData from "../../models/workout_data.js";

class PostRepo {
    #driver

    constructor() {
        this.#driver = Neo4jService.instance.driver
    }

    async getPosts(uid) {
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                MATCH (author:User {uid: $uidParam})-[:CREATED_POST]->(post:Post)-[:RECORDS]->(record:ActivityRecord)
                RETURN author, post {.*, createdDate: toString(post.createdDate)}, record
                ORDER BY post.createdDate DESC
                LIMIT 5`,
                { uidParam: uid },
            )
            return result.records.map(r => {
                const post = Post.fromNeo4j(r.get('post'))
                const author = r.get('author')['properties']
                post.author = {
                    'uid': author.uid,
                    'username': author.username,
                    'name': author.name,
                    'avatarUrl': author.avatarUrl,
                }
                post.record = ActivityRecord.fromNeo4j(r.get('record')['properties'])
                return post
            })
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async getNewsFeed(uid, viewedPostIds) {
        const session = this.#driver.session()
        try {
            const deleted = await this.deleteConnections(uid, viewedPostIds)
            const result = await session.run(`
                MATCH (user:User {uid: $uidParam})-[:ENGAGES_WITH]->(post)
                RETURN post.pid as pid
                ORDER BY post.createdDate DESC
                LIMIT 15`,
                { uidParam: uid },
            )
            const postIds = result.records.map(r => r.get('pid'))
            let cache = await this.getPostCache(uid)
            if(deleted.length > 0) {
                const arr = []
                let i = 0
                for (; i < 15 && i < deleted.length; i++) {
                    arr.push(deleted[i])
                }
                for (let j = 0; i < 15 && j < cache.length; j++) {
                    arr.push(cache[j])
                    i++
                }
                cache = arr
                await this.setPostCache(uid, arr)
            }
            if(postIds.length < 15) {
                postIds.push(...cache)
            }
            return postIds
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async getPostCache(uid) {
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                MATCH (user:User {uid: $uidParam})
                RETURN user.cache AS cache`,
                { uidParam: uid },
            )
            return result.records[0].get('cache') || []
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async setPostCache(uid, cache) {
        const session = this.#driver.session()
        try {
            await session.run(`
                MATCH (user:User {uid: $uidParam})
                SET user.cache = $cacheParam`,
                { uidParam: uid, cacheParam: cache },
            )
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async getPostsByIds(postIds) {
        if(postIds.length === 0) return []
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                UNWIND $postIdsParam as pid
                MATCH (author)-[:CREATED_POST]->(post:Post {pid: pid})-[:RECORDS]->(record)
                RETURN author, post {.*, createdDate: toString(post.createdDate)}, record`,
                { postIdsParam: postIds },
            )
            return result.records.map(r => {
                const post = Post.fromNeo4j(r.get('post'))
                const author = r.get('author')['properties']
                post.author = {
                    'uid': author.uid,
                    'username': author.username,
                    'name': author.name,
                    'avatarUrl': author.avatarUrl,
                }
                post.record = ActivityRecord.fromNeo4j(r.get('record')['properties'])
                return post
            })
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async getPostDetails(postId) {
        const session = this.#driver.session()
        try {
            const data = {}
            const result = await session.run(`
                MATCH (:Post {pid: $pidParam})-[:RECORDS]->(record:ActivityRecord)
                MATCH (record)-[:HOLDS_DATA]->(data:WorkoutData)
                OPTIONAL MATCH (record)-[:HOLDS_COORDINATES]->(coordinate:Coordinate)
                OPTIONAL MATCH (record)-[:HOLDS_PHOTO]->(photo:Photo)
                RETURN data, coordinate, photo`,
                { pidParam: postId },
            )
            data['data'] = WorkoutData
                    .fromNeo4j(result.records[0].get('data')['properties']).toJson()
            if(result.records[0].get('coordinate')) {
                const points = result
                        .records[0].get('coordinate')['properties']['points']
                const coordinates = []
                for (let i = 0; i < points.length; i+=2) {
                    coordinates.push(new Coordinate(points[i], points[i+1]))
                }
                data['coordinates'] = coordinates
            }
            if(result.records[0].get('photo')) {
                data['photos'] = result.records[0].get('photos')
                        .map(p => Photo.fromNeo4j(p['properties']))
            }
            return data
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async postExists(postId) {
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                MATCH (post:Post {pid: $pidParam})
                RETURN post`,
                { pidParam: postId },
            )
            return result.records.length === 1
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async createPost(post, uid) {
        if(!(post instanceof Post)) {
            throw new TypeError('"post" must be an instance of Post')
        }
        const session = this.#driver.session()
        const txc = session.beginTransaction()
        try {
            const coordinates = []
            for (const c of post.record.coordinates) {
                coordinates.push(c.latitude, c.longitude)
            }
            const neo4jPost = post.toNeo4j()
            const neo4jRecord = post.record.toNeo4j()
            const neo4jData = post.record.data.toNeo4j()
            
            const result = await txc.run(`
                MATCH (u:User {uid: $uidParam})
                CREATE (u)-[:CREATED_POST]->(post:Post $pProps)-[:RECORDS]->(record:ActivityRecord $rProps)-[:HOLDS_COORDINATES]->(:Coordinate {points: $cProps}), (record)-[:HOLDS_DATA]->(:WorkoutData $wProps)
                SET post.createdDate = datetime($dateParam)
                RETURN post`,
                { uidParam: uid, pProps: neo4jPost, rProps: neo4jRecord, cProps: coordinates, wProps: neo4jData, dateParam: neo4jPost.createdDate },
            )
            const createdNeo4jPost = result.records[0].get('post')['properties']
            createdNeo4jPost.createdDate = neo4jPost.createdDate
            await txc.commit()
            console.log('committed')
            return Post.fromNeo4j(createdNeo4jPost)
        } catch (error) {
            await txc.rollback()
            console.log('rolled back')
            throw error
        } finally {
            session.close()
        }
    }

    async createPostFiles({postId, photos, mapUrl}) {
        const session = this.#driver.session()
        try {
            const neo4jPhotos = photos.map(p => p.toNeo4j())
            await session.run(`
                MATCH (post:Post {pid: $pidParam})-[:RECORDS]->(record:ActivityRecord)
                SET post.mapUrl = $mapUrlParam
                WITH record
                UNWIND $eventsParams AS event
                CREATE (record)-[:HOLDS_PHOTO]->(photo:Photo)
                SET photo = event`,
                { pidParam: postId, eventsParams: neo4jPhotos, mapUrlParam: mapUrl },
            )
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async deletePost(postId, uid) {
        const session = this.#driver.session()
        try {
            await session.run(`
                MATCH (:User {uid: $uidParam})-[:CREATED_POST]->(post:Post {pid: $pidParam})
                MATCH (post)-[:RECORDS]->(record)
                OPTIONAL MATCH (record)-[:HOLDS_COORDINATES]->(coordinate)
                OPTIONAL MATCH (record)-[:HOLDS_PHOTOS]->(photo)
                OPTIONAL MATCH (record)-[:HOLDS_DATA]->(data)
                DETACH DELETE post, record, coordinate, photo, data`,
                { uidParam: uid, pidParam: postId },
            )
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async countPostLikes(postId, uid) {
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                MATCH (:Post {pid: $pidParam})-[r:LIKED_BY]->(:User)
                RETURN count(r) AS likes`,
                { pidParam: postId },
            )
            const likes = result.records[0].get('likes')['low']
            const isLiked = await this.isLikedBy(postId, uid)
            return { likes, isLiked }
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async isLikedBy(postId, uid) {
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                MATCH (:Post {pid: $pidParam})-[r:LIKED_BY]->(:User {uid: $uidParam})
                RETURN r`,
                { pidParam: postId, uidParam: uid },
            )
            return result.records[0] != undefined
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async createPostLike(postId, uid) {
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                MATCH (user:User {uid: $uidParam})
                MATCH (post:Post {pid: $pidParam})
                WHERE NOT (post)-[:LIKED_BY]->(user)
                CREATE (post)-[r:LIKED_BY]->(user)
                RETURN r`,
                { uidParam: uid, pidParam: postId },
            )
            return result.records[0]
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async deletePostLike(postId, uid) {
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                MATCH (:Post {pid: $pidParam})-[r:LIKED_BY]->(:User {uid: $uidParam})
                DELETE r
                RETURN r`,
                { pidParam: postId, uidParam: uid  },
            )
            return result.records[0]
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async getUserReactions(uid, postId) {
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                MATCH (:Post {pid: $pidParam})-[:LIKED_BY]->(author:User)
                OPTIONAL MATCH (:User {uid: $uidParam})-[r:IS_FOLLOWING]->(author)
                RETURN author, r as following
                LIMIT 20`,
                { pidParam: postId, uidParam: uid },
            )
            return result.records.map(r => {
                const userNeo4j = r.get('author')['properties']
                const isFollowing = r.get('following') != null
                return {
                    'uid': userNeo4j.uid,
                    'username': userNeo4j.username,
                    'name': userNeo4j.name,
                    'avatarUrl': userNeo4j.avatarUrl,
                    'isFollowing': isFollowing,
                }
            })
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async countComments(postId, path) {
        const session = this.#driver.session()
        try {
            //? count all comments
            if(path == undefined) {
                const result = await session.run(`
                    MATCH (:Post {pid: $pidParam})-[r:COMMENTED_BY]->(:Comment)
                    RETURN count(r) AS comments`,
                    { pidParam: postId },
                )
                return result.records[0].get('comments')['low']
            }
            //? count independent comments
            if(path.length === 0) {
                const result = await session.run(`
                    MATCH (:Post {pid: $pidParam})-[r:COMMENTED_BY]->(comment:Comment)
                    WHERE NOT (comment)-[:REPLIED_FOR]->(:Comment)
                    RETURN count(r) AS comments`,
                    { pidParam: postId },
                )
                return result.records[0].get('comments')['low']
            }
            //? count dependent comments with a given path
            const result = await session.run(`
                MATCH (:Post {pid: $pidParam})-[r:COMMENTED_BY]->(comment:Comment)
                WHERE comment.path CONTAINS $pathParam
                RETURN count(r) AS comments`,
                { pidParam: postId, pathParam: path },
            )
            return result.records[0].get('comments')['low']
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async getIndependentComments(postId, lessThanDate) {
        const session = this.#driver.session()
        try {
            //? Comments without parent
            let result
            if(lessThanDate == undefined) {
                result = await session.run(`
                    MATCH (:Post {pid: $pidParam})-[:COMMENTED_BY]->(comment:Comment)<-[:COMMENTED]-(user:User)
                    WHERE NOT (comment)-[:REPLIED_FOR]->(:Comment)
                    RETURN comment, user
                    ORDER BY comment.createdDate DESC
                    LIMIT 15`,
                    { pidParam: postId },
                )
            }else {
                result = await session.run(`
                    MATCH (:Post {pid: $pidParam})-[:COMMENTED_BY]->(comment:Comment)<-[:COMMENTED]-(user:User)
                    WHERE NOT (comment)-[:REPLIED_FOR]->(:Comment) AND comment.createdDate < $dateParam
                    RETURN comment, user
                    ORDER BY comment.createdDate DESC
                    LIMIT 15`,
                    { pidParam: postId, dateParam: parseInt(lessThanDate) },
                )
            }
            return result.records.map(r => {
                const comment = Comment.fromNeo4j(r.get('comment')['properties'])
                const userNeo4j = r.get('user')['properties']
                comment.author = {
                    'username': userNeo4j.username,
                    'avatarUrl': userNeo4j.avatarUrl,
                }
                return comment
            })
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async getDependentComments({postId, path, lessThanDate}) {
        const session = this.#driver.session()
        try {
            //? Comments with path
            let result
            if(lessThanDate == undefined) {
                result = await session.run(`
                    MATCH (:Post {pid: $pidParam})-[:COMMENTED_BY]->(comment:Comment)
                    WHERE comment.path CONTAINS $pathParam
                    MATCH (author:User)-[:COMMENTED]->(comment)-[:REPLIED_FOR]->(replyTo:Comment)<-[:COMMENTED]-(user:User)
                    RETURN comment, author, replyTo, user
                    ORDER BY comment.createdDate ASC
                    LIMIT 5`,
                    { pidParam: postId, pathParam: path },
                )
            }else {
                result = await session.run(`
                    MATCH (:Post {pid: $pidParam})-[:COMMENTED_BY]->(comment:Comment)
                    WHERE comment.path CONTAINS $pathParam AND comment.createdDate > $dateParam
                    MATCH (author:User)-[:COMMENTED]->(comment)-[:REPLIED_FOR]->(replyTo:Comment)<-[:COMMENTED]-(user:User)
                    RETURN comment, author, replyTo, user
                    ORDER BY comment.createdDate ASC
                    LIMIT 5`,
                    { pidParam: postId, pathParam: path, dateParam: parseInt(lessThanDate) },
                )
            }
            return result.records.map(r => {
                const comment = Comment.fromNeo4j(r.get('comment')['properties'])
                const authorNeo4j = r.get('author')['properties']
                const replyToNeo4j = r.get('replyTo')['properties']
                const userNeo4j = r.get('user')['properties']
                comment.author = {
                    'username': authorNeo4j.username,
                    'avatarUrl': authorNeo4j.avatarUrl,
                }
                comment.replyTo = {
                    'cid': replyToNeo4j.cid,
                    'path': replyToNeo4j.path,
                }
                comment.replyTo.author = {
                    'username': userNeo4j.username,
                }
                return comment
            })
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async createComment({comment, postId, uid}) {
        const session = this.#driver.session()
        const txc = session.beginTransaction()
        try {
            comment.path = comment.replyTo == undefined 
                ? comment.cid 
                : `${comment.replyTo.path}/${comment.cid}`
            const neo4jComment = comment.toNeo4j()
            const result = await txc.run(`
                MATCH (u:User {uid: $uidParam})
                MATCH (p:Post {pid: $pidParam})
                CREATE (u)-[:COMMENTED]->(comment:Comment $cProps)<-[:COMMENTED_BY]-(p)
                RETURN comment`,
                { uidParam: uid, pidParam: postId, cProps: neo4jComment },
            )
            const createdComment = result.records[0].get('comment')['properties']
            const data = Comment.fromNeo4j(createdComment)
            if(comment.replyTo != undefined) {
                const result = await txc.run(`
                    MATCH (replyTo:Comment {cid: $pCidParam})
                    MATCH (child:Comment {cid: $cCidParam})
                    CREATE (child)-[:REPLIED_FOR]->(replyTo)
                    RETURN replyTo`,
                    { pCidParam: comment.replyTo.cid, cCidParam: createdComment.cid },
                )
                const replyTo = result.records[0].get('replyTo')['properties']
                data.replyTo = Comment.fromNeo4j(replyTo)
            }
            await txc.commit()
            console.log('committed')
            return data
        } catch (error) {
            await txc.rollback()
            console.log('rolled back')
            throw error
        } finally {
            session.close()
        }
    }

    async deleteComment({commentId, uid}) {
        const session = this.#driver.session()
        try {
            const results = await session.run(`
                MATCH (:User {uid: $uidParam})-[:COMMENTED]->(c:Comment {cid: $cidParam})
                DETACH DELETE c
                RETURN c`,
                { uidParam: uid, cidParam: commentId },
            )
            return results.records[0]
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async createConnections(uid, postId) {
        const session = this.#driver.session()
        try {
            const results = await session.run(`
                MATCH (user:User {uid: $uidParam})
                MATCH (follower:User)-[:IS_FOLLOWING]->(user)
                MATCH (user)-[:CREATED_POST]->(post:Post {pid: $pidParam})
                CREATE (follower)-[r:ENGAGES_WITH]->(post)
                RETURN count(r) AS connections`,
                { uidParam: uid, pidParam: postId },
            )
            return results.records[0].get('connections')['low']
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async deleteConnections(uid, postIds) {
        if(postIds.length === 0) return []
        const session = this.#driver.session()
        try {
            const results = await session.run(`
                MATCH (user:User {uid: $uidParam})
                UNWIND $postIdsParam AS pid
                MATCH (user)-[r:ENGAGES_WITH]->(post:Post {pid: pid})
                DELETE r
                RETURN pid`,
                { uidParam: uid, postIdsParam: postIds },
            )
            return results.records.map(e => e.get('pid'))
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }
}

export default PostRepo;