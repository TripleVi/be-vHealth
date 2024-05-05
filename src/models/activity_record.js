import { recordProps } from "../data/neo4j/neo4j_properties.js";

class ActivityRecord {
    constructor(category, startDate, endDate, activeTime, distance, avgSpeed, maxSpeed, steps, calories, coordinates, photos, data) {
        this.category = category
        this.startDate = startDate
        this.endDate = endDate
        this.activeTime = activeTime
        this.distance = distance
        this.avgSpeed = avgSpeed
        this.maxSpeed = maxSpeed
        this.steps = steps
        this.calories = calories
        this.coordinates = coordinates
        this.photos = photos
        this.data = data
    }

    static fromJson(json) {
        return new ActivityRecord(json["category"], json["startDate"], json["endDate"], json["activeTime"], json["distance"], json["avgSpeed"], json["maxSpeed"], json["steps"], json["calories"])
    }

    static fromNeo4j(neo4jRecord) {
        return new ActivityRecord(
            neo4jRecord[recordProps.category], neo4jRecord[recordProps.startDate], neo4jRecord[recordProps.endDate], neo4jRecord[recordProps.activeTime], neo4jRecord[recordProps.distance], neo4jRecord[recordProps.avgSpeed], neo4jRecord[recordProps.maxSpeed], neo4jRecord[recordProps.steps], neo4jRecord[recordProps.calories],
        )
    }

    toNeo4j() {
        const neo4jRecord = {}
        neo4jRecord[recordProps.category] = this.category
        neo4jRecord[recordProps.startDate] = this.startDate
        neo4jRecord[recordProps.endDate] = this.endDate
        neo4jRecord[recordProps.activeTime] = this.activeTime
        neo4jRecord[recordProps.distance] = this.distance
        neo4jRecord[recordProps.avgSpeed] = this.avgSpeed
        neo4jRecord[recordProps.maxSpeed] = this.maxSpeed
        neo4jRecord[recordProps.steps] = this.steps
        neo4jRecord[recordProps.calories] = this.calories
        return neo4jRecord
    }
}

export default ActivityRecord