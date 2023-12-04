import { photoProps } from "../data/neo4j/neo4j_properties.js";
import { generateId } from "../utils/helper.js";

class Photo {
    constructor(latitude, longitude, photoUrl) {
        this.pid = generateId()
        this.latitude = latitude
        this.longitude = longitude
        this.photoUrl = photoUrl
    }

    toNeo4j() {
        const neo4jPhoto = {}
        neo4jPhoto[photoProps.pid] = this.pid
        neo4jPhoto[photoProps.latitude] = this.latitude
        neo4jPhoto[photoProps.longitude] = this.longitude
        neo4jPhoto[photoProps.photoUrl] = this.photoUrl
        return neo4jPhoto
    }
}

export default Photo