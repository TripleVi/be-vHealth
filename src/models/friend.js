import { friendProps } from "../data/neo4j/neo4j_properties.js";

class Friend {
    constructor(uid, username, firstName, lastName, avatarUrl, isFollowing, mutual) {
        this.uid = uid
        this.username = username
        this.firstName = firstName
        this.lastName = lastName
        this.avatarUrl = avatarUrl
        this.isFollowing = isFollowing
        this.mutual = mutual
    }

    static fromJson(json) {
        return new Friend(json['uid'], json['username'], json['firstName'], json['lastName'], json['avatarUrl'])
    }

    static fromNeo4j(neo4jFriend) {
        return new Friend(
            neo4jFriend[friendProps.uid], neo4jFriend[friendProps.username], neo4jFriend[friendProps.firstName], neo4jFriend[friendProps.lastName], neo4jFriend[friendProps.avatarUrl]
        )
    }
}

export default Friend