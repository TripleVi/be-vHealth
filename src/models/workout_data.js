import { workoutDataProps } from "../data/neo4j/neo4j_properties.js";

class WorkoutData {
    constructor(speed, pace, distance, timeFrame) {
        this.speed = speed
        this.pace = pace
        this.distance = distance
        this.timeFrame = timeFrame
    }

    static fromJson(json) {
        return new WorkoutData(json['speed'], json['pace'], json['distance'], json['timeFrame'])
    }

    static fromNeo4j(neo4jData) {
        return new WorkoutData(
            neo4jData[workoutDataProps.speed], neo4jData[workoutDataProps.pace], neo4jData[workoutDataProps.distance], neo4jData[workoutDataProps.timeFrame]
        )
    }

    toNeo4j() {
        const neo4jData = {}
        neo4jData[workoutDataProps.speed] = this.speed
        neo4jData[workoutDataProps.pace] = this.pace
        neo4jData[workoutDataProps.distance] = this.distance
        neo4jData[workoutDataProps.timeFrame] = this.timeFrame
        return neo4jData
    }
}

export default WorkoutData