import { friendProps } from "../data/neo4j/neo4j_properties.js";

class Friend {
    constructor(uid, username, name, avatarUrl, isFollowing, mutual) {
        this.uid = uid
        this.username = username
        this.name = name
        this.avatarUrl = avatarUrl
        this.isFollowing = isFollowing
        this.mutual = mutual
    }

    static fromJson(json) {
        return new Friend(json['uid'], json['username'], json['name'], json['avatarUrl'])
    }

    static fromNeo4j(neo4jFriend) {
        return new Friend(
            neo4jFriend[friendProps.uid], neo4jFriend[friendProps.username], neo4jFriend[friendProps.name], neo4jFriend[friendProps.avatarUrl]
        )
    }
}

export default Friend