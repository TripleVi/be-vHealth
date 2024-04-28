import Neo4jService from "../neo4j/neo4j_service.js";
import Friend from "../../models/friend.js";

class FriendRepo {
    #driver

    constructor() {
        this.#driver = Neo4jService.instance.driver
    }

    async getFriends(uid, username) {
        const session = this.#driver.session()
        try {
            let result
            if(username == undefined) {
                result = await session.run(`
                    MATCH (friend:User)
                    RETURN friend`,
                )
            }else {
                result = await session.run(`
                    MATCH (user:User {uid: $uidParam})
                    MATCH (friend:User)
                    WHERE NOT friend.uid = user.uid AND friend.username CONTAINS $usernameParam
                    OPTIONAL MATCH (user)-[r:IS_FOLLOWING]->(friend)
                    OPTIONAL MATCH (user)-[:IS_FOLLOWING]->(mutual:User)<-[:IS_FOLLOWING]-(friend)
                    RETURN friend, r, count(mutual) AS mutual`,
                    { uidParam: uid, usernameParam: username }
                )
            }
            return result.records.map(r => {
                const friend = Friend.fromNeo4j(r.get('friend')['properties'])
                friend.isFollowing = r.get('r') != null
                friend.mutual = r.get('mutual')['low']
                return friend
            })
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async getFollowings(uid) {
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                MATCH (:User {uid: $uidParam})-[:IS_FOLLOWING]->(followee:User)
                RETURN followee`,
                { uidParam: uid }
            )
            return result.records.map(r => 
                Friend.fromNeo4j(r.get('followee')['properties'])
            )
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async getFollowers(uid) {
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                MATCH (:User {uid: $uidParam})<-[:IS_FOLLOWING]-(follower:User)
                RETURN follower`,
                { uidParam: uid }
            )
            return result.records.map(r => 
                Friend.fromNeo4j(r.get('follower')['properties'])
            )
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async countMutual(uid, friendId) {
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                MATCH (:User {uid: $uidParam})-[:IS_FOLLOWING]->(mutual:User)<-[:IS_FOLLOWING]-(:User {uid: $fidParam})
                RETURN count(mutual) AS mutual`,
                { uidParam: uid, fidParam: friendId }
            )
            return result.records[0].get('mutual')['low']
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async userExists(uid) {
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                MATCH(user:User {uid: $uidParam})
                RETURN user`,
                { uidParam: uid },
            )
            return result.records.length === 1
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async isFollowing(uid, friendId) {
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                MATCH (:User {uid: $uidParam})-[r:IS_FOLLOWING]->(:User {uid: $fidParam})
                RETURN r`,
                { uidParam: uid, fidParam: friendId }
            )
            return result.records[0] != undefined 
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async followFriend(uid, friend) {
        if(!(friend instanceof Friend)) {
            throw new TypeError('"friend" must be an instance of Friend')
        }
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                MATCH (user:User {uid: $uidParam})
                MATCH (friend:User {uid: $fidParam})
                CREATE (user)-[r:IS_FOLLOWING]->(friend)
                RETURN r`,
                { uidParam: uid, fidParam: friend.uid }
            )
            return result.records[0] 
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async unfollowFriend(uid, friendId) {
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                MATCH (:User {uid: $uidParam})-[r:IS_FOLLOWING]->(:User {uid: $fidParam})
                DELETE r
                RETURN r`,
                { uidParam: uid, fidParam: friendId }
            )
            return result.records[0] 
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async countFollowings(uid) {
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                MATCH (:User {uid: $uidParam})-[r:IS_FOLLOWING]->(:User)
                RETURN count(r) AS followings`,
                { uidParam: uid },
            )
            const followings = result.records[0].get('followings')['low']
            return followings
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async countFollowers(uid) {
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                MATCH (:User {uid: $uidParam})<-[r:IS_FOLLOWING]-(:User)
                RETURN count(r) AS followers`,
                { uidParam: uid },
            )
            const followers = result.records[0].get('followers')['low']
            return followers
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }
}

export default FriendRepo;