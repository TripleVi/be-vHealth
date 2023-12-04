import { postProps } from "../data/neo4j/neo4j_properties.js";

class Post {
    constructor(pid, title, content, createdDate, privacy, latitude, longitude, mapUrl, record, reactions, user) {
        this.pid = pid
        this.title = title
        this.content = content
        this.createdDate = createdDate
        this.privacy = privacy
        this.latitude = latitude
        this.longitude = longitude
        this.mapUrl = mapUrl
        this.record = record
        this.reactions = reactions
        this.user = user
    }

    static fromJson(json) {
        return new Post(json['pid'], json['title'], json['content'], json['createdDate'], json['privacy'], json['latitude'], json['longitude'], json['mapUrl'])
    }

    static fromNeo4j(neo4jPost) {
        return new Post(
            neo4jPost[postProps.pid], neo4jPost[postProps.title], neo4jPost[postProps.content], neo4jPost[postProps.createdDate], neo4jPost[postProps.privacy], neo4jPost[postProps.latitude], neo4jPost[postProps.longitude], neo4jPost[postProps.mapUrl]
        )
    }

    toNeo4j() {
        const neo4jPost = {}
        neo4jPost[postProps.pid] = this.pid
        neo4jPost[postProps.title] = this.title
        neo4jPost[postProps.content] = this.content
        neo4jPost[postProps.createdDate] = this.createdDate
        neo4jPost[postProps.privacy] = this.privacy
        neo4jPost[postProps.latitude] = this.latitude
        neo4jPost[postProps.longitude] = this.longitude
        neo4jPost[postProps.mapUrl] = this.mapUrl
        return neo4jPost
    }
}

export default Post