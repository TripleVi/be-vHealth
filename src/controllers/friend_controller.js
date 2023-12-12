import FriendRepo from "../data/repositories/friend_repo.js";
import Friend from "../models/friend.js";

class FriendController {
    
    async getFollowings(req, res) {
        try {
            const uid = req.params.id
            const repo = new FriendRepo()
            const followings = await repo.getFollowings(uid)
            res.send(followings)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }

    async getFollowers(req, res) {
        try {
            const uid = req.params.id
            const repo = new FriendRepo()
            const followers = await repo.getFollowers(uid)
            res.send(followers)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }

    async followFriend(req, res) {
        try {
            const uid = req.headers.uid
            const friend = Friend.fromJson(req.body)
            const repo = new FriendRepo()
            const flag = await repo.userExists(friend.uid)
            if(uid === friend.uid || !flag) {
                return res.status(400).send({
                    message: 'No friend exists',
                })
            }
            const isFollowing = await repo.isFollowing(uid, friend.uid)
            if(isFollowing) {
                return res.sendStatus(200)
            }
            const result = await repo.followFriend(uid, friend)
            res.sendStatus(result == undefined ? 200 : 201)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }

    async unfollowFriend(req, res) {
        try {
            const uid = req.headers.uid
            const friendId = req.params.id
            const repo = new FriendRepo()
            const flag = await repo.userExists(friendId)
            if(uid === friendId || !flag) {
                return res.status(400).send({
                    message: 'No friend exists',
                })
            }
            const isFollowing = await repo.isFollowing(uid, friendId)
            if(!isFollowing) {
                return res.sendStatus(200)
            }
            const result = await repo.unfollowFriend(uid, friendId)
            res.sendStatus(result == undefined ? 200 : 201)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }

    async countFollowings(req, res) {
        try {
            const uid = req.params.id
            const repo = new FriendRepo()
            const followings = await repo.countFollowings(uid)
            res.send({ followings })
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }

    async countFollowers(req, res) {
        try {
            const uid = req.params.id
            const repo = new FriendRepo()
            const followers = await repo.countFollowers(uid)
            res.send({ followers })
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }
}

export default new FriendController()