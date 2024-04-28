import { workoutDataProps } from "../data/neo4j/neo4j_properties.js";

class WorkoutData {
    constructor(steps, speeds, distances, calories, times) {
        this.steps = steps
        this.speeds = speeds
        this.distances = distances
        this.calories = calories
        this.times = times
    }

    static fromJson(json) {
        const steps = [], speeds = [], distances = [], calories = [], times = []
        for (const d of json) {
            steps.push(d.steps)
            speeds.push(d.speed)
            distances.push(d.distance)
            calories.push(d.calories)
            times.push(d.time)
        }
        return new WorkoutData(steps, speeds, distances, calories, times)
    }

    toJson() {
        const workoutData = []
        const length = this.steps.length
        for (let i = 0; i < length; i++) {
            workoutData.push({
                'steps': this.steps[i],
                'speed': this.speeds[i],
                'distance': this.distances[i],
                'calories': this.calories[i],
                'time': this.times[i],
            })
        }
        return workoutData
    }

    static fromNeo4j(neo4jData) {
        return new WorkoutData(
            neo4jData[workoutDataProps.steps], neo4jData[workoutDataProps.speeds], neo4jData[workoutDataProps.distances], neo4jData[workoutDataProps.calories], neo4jData[workoutDataProps.times],
        )
    }

    toNeo4j() {
        const neo4jData = {}
        neo4jData[workoutDataProps.steps] = this.steps
        neo4jData[workoutDataProps.speeds] = this.speeds
        neo4jData[workoutDataProps.distances] = this.distances
        neo4jData[workoutDataProps.calories] = this.calories
        neo4jData[workoutDataProps.times] = this.times
        return neo4jData
    }
}

export default WorkoutData