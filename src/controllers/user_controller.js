import UserRepo from '../data/repositories/user_repo.js';
import { UserCreationDto, UserResponseDto } from '../utils/dto/user_dto.js';

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
            if(user == null) {
                return res.status(404).send({
                    message: 'User not found.',
                })
            }
            const data = new UserResponseDto(user)
            res.send(data)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }

    async getFollowing(req, res) {
        const uid = req.params.id
        const userRepo = new UserRepo()
        try {
            const user = await userRepo.getUserById(uid)
            if(user == null) {
                return res.status(404).send({
                    message: 'User not found.',
                })
            }
            const following = await userRepo.getFollowing(uid)
            res.send(following)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }

    async getFollowers(req, res) {
        const uid = req.params.id
        const userRepo = new UserRepo()
        try {
            const user = await userRepo.getUserById(uid)
            if(user == null) {
                return res.status(404).send({
                    message: 'User not found.',
                })
            }
            const followers = await userRepo.getFollowers(uid)
            res.send(followers)
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

    async editProfile(req, res) {
        const userRepo = new UserRepo()
        const uid = req.params.id
        const userInfo = req.body
        console.log(userInfo)
        try {
            const flag = await userRepo.userExists(uid)
            if(!flag) {
                return res.status(400).send({
                    message: 'No user exists',
                })
            }
            await userRepo.updateProfile(uid, userInfo)
            res.sendStatus(204)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
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

    async updateMetadata(req, res) {
        try {
            const uid = req.params.id
            const userRepo = new UserRepo()
            const result = await userRepo.updateMetadata(uid, req.body)
            res.status(201).send(result)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }
}

export default new UserController()