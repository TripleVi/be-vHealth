import UserRepo from "../data/repositories/user_repo.js";
import { UserCreationDto, UserResponseDto } from "../utils/dto/user_dto.js";

class UserController {
    async getUsers(req, res) {
        const userRepo = new UserRepo()
        const options = req.query
        // try {
            const users = await userRepo.getUsers(options)
            const data = users.map(u => new UserResponseDto(u))
            res.send(data)
        // } catch (error) {
        //     console.log(error)
        //     res.sendStatus(500)
        // }
    }

    async getUserById(req, res) {
        const uid = req.params.id
        const userRepo = new UserRepo()
        try {
            const user = await userRepo.getUserById(uid)
            const data = new UserResponseDto(user)
            res.send(data)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }
    
    async createUser(req, res) {
        const userRepo = new UserRepo()
        const newUser = new UserCreationDto(req.body).toUser()
        // try {
            const createdUser = await userRepo.createUser(newUser)
            const data = new UserResponseDto(createdUser)
            res.status(201).send(data)
        // } catch (error) {
        //     console.log(error)
        //     res.sendStatus(500)
        // }
    }

    async deleteUser(req, res) {
        const userRepo = new UserRepo()
        const userId = req.params.id
        try {
            await userRepo.deleteUser(userId)
            res.sendStatus(204)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }
}

export default new UserController()