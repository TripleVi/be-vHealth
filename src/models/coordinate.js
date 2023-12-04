class Coordinate {
    constructor(latitude, longitude) {
        this.latitude = latitude
        this.longitude = longitude
    }

    static fromJson(json) {
        return new Coordinate(json['latitude'], json['longitude'])
    }
}

export default Coordinate