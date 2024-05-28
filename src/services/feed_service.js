import FriendRepo from '../data/repositories/friend_repo.js';
import UserMetadata from '../models/user_metadata.js';

class FeedService {
    async feedGeneration() {
        
    }

    async feedPublishing(uid, post) {
        const repo = new FriendRepo()
        const client = await RedisService.instance.client
        const followers = await repo.getFollowers(uid)
        followers.map(async f => {
            const redisObj = await client.hGetAll(`${f.uid}:metadata`)
            const metadata = UserMetadata.fromRedis(redisObj)
            const msecs = Math.abs(post.createdDate - parseInt(metadata.lastActiveTime))
            const days = Math.floor(msecs / (60*60*24*1000))
            if(days <= 30) {
                // return the length of the list
                await client.rPush(`${f.uid}:posts`, post.pid)
                console.log(changes)
                // Notify
                console.log('new post from ...')
            }

        })
    }
}

export default FeedService