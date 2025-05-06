import redisService from '../redis/redis_service.js'

async function deleteViewedPosts(uid, viewedIds) {
    if(viewedIds.length === 0) return []
    const cache = await redisService.database
    const key = `${uid}:posts`
    const ids = await cache.lRange(key, 0, -1)
    ids.splice(ids.indexOf(viewedIds[0]), viewedIds.length)
    await cache.del(key)
    await cache.rPush(key, ids)
}

export async function getActivityFeed(uid, viewedPostIds) {
    const cache = await redisService.database
    await deleteViewedPosts(uid, viewedPostIds)
    const postIds = cache.lRange(`${uid}:posts`, -15, -1)
    return postIds.reverse()
}

export async function feedPublishing(uid, post) {
    const repo = new FriendRepo()
    const cache = await redisService.database
    const followers = await repo.getFollowers(uid)
    followers.map(async f => {
        await cache.rPush(`${f.uid}:posts`, post.pid)
    })
}
