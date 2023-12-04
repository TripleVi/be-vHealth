import { checkSchema, validationResult } from "express-validator";
import { EUserGender } from "../enums/user_enums.js";

class UserValidators {
    async validateUserCreation(req, res, next) {
        await checkSchema({
            uid: { isString: { errorMessage: 'Uid must be a string' } },
            username: { trim: true, notEmpty: { errorMessage: 'Username cannot start with whitespace' }, escape: true },
            email: { isEmail: { errorMessage: 'Email must be in the form of an email' } },
            firstName: { trim: true, notEmpty: { errorMessage: 'First name cannot start with whitespace' }, escape: true },
            lastName: { trim: true, notEmpty: { errorMessage: 'Last name cannot start with whitespace' }, escape: true },
            dateOfBirth: { isDate: true },
            gender: { isIn: { options: [EUserGender.numericValues], errorMessage: 'Gender must be either 0 - male | 1 - female | -1 - other' } },
            weight: { isFloat: { options: { gt: 0.0 }, errorMessage: 'Weight must be greater than 0.0' } },
            height: { isFloat: { options: { min: 0.0 }, errorMessage: 'Height must be greater than 0.0' } },
            avatarUrl: { isURL: { errorMessage: 'Avatar Url must be in the form of an Url' } },
        }, ['body']).run(req)
        const result = validationResult(req)
        if(result.isEmpty()) {
            return next()
        }
        res.status(422).send({ errors: result.array() })
    }

    async validateUserDeletion(req, res, next) {
        await checkSchema({
            id: { isSlug: { errorMessage: 'UserId must be a string' } },
        }, ['params']).run(req)
        const result = validationResult(req)
        if(result.isEmpty()) {
            return next()
        }
        res.status(422).send({ errors: result.array() })
    }

    async validateUserOptions(req, res, next) {
        await checkSchema({
            email: { isEmail: { errorMessage: 'Email must be in the form of an email' }, optional: { options: { values: 'undefined' } } },
            username: { trim: true, notEmpty: { errorMessage: 'Username cannot start with whitespace' }, escape: true, optional: { options: { values: 'undefined'} } },
        }, ['query']).run(req)
        const result = validationResult(req)
        if(result.isEmpty()) {
            return next()
        }
        res.status(422).send({ errors: result.array() })
    }
}

export default new UserValidators()