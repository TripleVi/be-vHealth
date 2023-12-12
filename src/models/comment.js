import { commentProps } from "../data/neo4j/neo4j_properties.js";

class Comment {
    constructor(cid, content, createdDate, path, author, replyTo) {
        this.cid = cid
        this.content = content
        this.createdDate = createdDate
        this.path = path
        this.author = author
        this.replyTo = replyTo
    }

    static fromJson(json) {
        return new Comment(json['cid'], json['content'], json['createdDate'], json['path'])
    }

    toNeo4j() {
        const neo4jComment = {}
        neo4jComment[commentProps.cid] = this.cid
        neo4jComment[commentProps.content] = this.content
        neo4jComment[commentProps.createdDate] = this.createdDate
        neo4jComment[commentProps.path] = this.path
        return neo4jComment
    }

    static fromNeo4j(neo4jComment) {
        return new Comment(neo4jComment[commentProps.cid], neo4jComment[commentProps.content], neo4jComment[commentProps.createdDate], neo4jComment[commentProps.path])
    }
}

export default Comment