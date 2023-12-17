import { recordProps } from "../data/neo4j/neo4j_properties.js";

class ActivityRecord {
    constructor(category, startDate, endDate, workoutDuration, distance, avgSpeed, maxSpeed, avgPace, maxPace, steps, stairsClimbed, calories, mapUrl, coordinates, photos, data) {
        this.category = category
        this.startDate = startDate
        this.endDate = endDate
        this.workoutDuration = workoutDuration
        this.distance = distance
        this.avgSpeed = avgSpeed
        this.maxSpeed = maxSpeed
        this.avgPace = avgPace
        this.maxPace = maxPace
        this.steps = steps
        this.stairsClimbed = stairsClimbed
        this.calories = calories
        this.mapUrl = mapUrl
        this.coordinates = coordinates
        this.photos = photos
        this.data = data
    }

    static fromJson(json) {
        return new ActivityRecord(json["category"], json["startDate"], json["endDate"], json["workoutDuration"], json["distance"], json["avgSpeed"], json["maxSpeed"], json["avgPace"], json["maxPace"], json["steps"], json["stairsClimbed"], json["calories"], json["mapUrl"])
    }

    static fromNeo4j(neo4jRecord) {
        return new ActivityRecord(
            neo4jRecord[recordProps.category], neo4jRecord[recordProps.startDate], neo4jRecord[recordProps.endDate], neo4jRecord[recordProps.workoutDuration], neo4jRecord[recordProps.distance], neo4jRecord[recordProps.avgSpeed], neo4jRecord[recordProps.maxSpeed], neo4jRecord[recordProps.avgPace], neo4jRecord[recordProps.maxPace], neo4jRecord[recordProps.steps], neo4jRecord[recordProps.stairsClimbed], neo4jRecord[recordProps.calories], neo4jRecord[recordProps.mapUrl]
        )
    }

    toNeo4j() {
        const neo4jRecord = {}
        neo4jRecord[recordProps.category] = this.category
        neo4jRecord[recordProps.startDate] = this.startDate
        neo4jRecord[recordProps.endDate] = this.endDate
        neo4jRecord[recordProps.workoutDuration] = this.workoutDuration
        neo4jRecord[recordProps.distance] = this.distance
        neo4jRecord[recordProps.avgSpeed] = this.avgSpeed
        neo4jRecord[recordProps.maxSpeed] = this.maxSpeed
        neo4jRecord[recordProps.avgPace] = this.avgPace
        neo4jRecord[recordProps.maxPace] = this.maxPace
        neo4jRecord[recordProps.steps] = this.steps
        neo4jRecord[recordProps.stairsClimbed] = this.stairsClimbed
        neo4jRecord[recordProps.calories] = this.calories
        neo4jRecord[recordProps.mapUrl] = this.mapUrl
        return neo4jRecord
    }
}

export default ActivityRecord