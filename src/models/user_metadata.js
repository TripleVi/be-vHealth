import { userMetadataProps } from '../data/redis/redis_properties.js';

class UserMetadata {
    constructor(active, lastActiveTime) {
        this.active = active
        this.lastActiveTime = lastActiveTime
    }

    static fromJson(json) {
        return new UserMetadata(json['active'], json['lastActiveTime'])
    }

    static fromRedis(redis) {
        return new UserMetadata(
            redis[userMetadataProps.active] === 'true',
            redis[userMetadataProps.lastActiveTime],
        )
    }

    toRedis() {
        const redisObj = {}
        redisObj[userMetadataProps.active] = this.active
        redisObj[userMetadataProps.lastActiveTime] = this.lastActiveTime
        return redisObj
    }
}

export default UserMetadata