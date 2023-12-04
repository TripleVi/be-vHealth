class EUserGender {
    static #male = new EUserGender()
    static #female = new EUserGender()
    static #other = new EUserGender()

    static get male() {
        return EUserGender.#male
    }

    static get female() {
        return EUserGender.#female
    }

    static get other() {
        return EUserGender.#other
    }

    static get numericValues() {
        return [0, 1, -1]
    }

    get numericValue() {
        switch (this) {
            case EUserGender.male:
                return 0
            case EUserGender.female:
                return 1
            case EUserGender.other:
                return -1
            default:
                return undefined
        }
    }

    get stringValue() {
        switch (this) {
            case EUserGender.male:
                return 'Male'
            case EUserGender.female:
                return 'Female'
            case EUserGender.other:
                return 'Other'
            default:
                return undefined
        }
    }
}

export { EUserGender }