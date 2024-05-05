import { workoutDataProps } from "../data/neo4j/neo4j_properties.js";

class WorkoutData {
    constructor(speeds, times) {
        this.speeds = speeds
        this.times = times
    }

    static fromJson(json) {
        const speeds = [], times = []
        for (const d of json) {
            speeds.push(d.speed)
            times.push(d.time)
        }
        return new WorkoutData(speeds, times)
    }

    toJson() {
        const workoutData = []
        const length = this.times.length
        for (let i = 0; i < length; i++) {
            workoutData.push({
                'speed': this.speeds[i],
                'time': this.times[i],
            })
        }
        return workoutData
    }

    static fromNeo4j(neo4jData) {
        return new WorkoutData(
            neo4jData[workoutDataProps.speeds], neo4jData[workoutDataProps.times],
        )
    }

    toNeo4j() {
        const neo4jData = {}
        neo4jData[workoutDataProps.speeds] = this.speeds
        neo4jData[workoutDataProps.times] = this.times
        return neo4jData
    }
}

export default WorkoutData