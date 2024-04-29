import PostRepo from '../data/repositories/post_repo.js';
import UserRepo from '../data/repositories/user_repo.js';

class FeedController {
    async fetchNewsFeed(req, res) {
        try {
            const uid = req.headers.uid
            const viewedPostIds = req.body.viewedPostIds
            const postRepo = new PostRepo()
            const userRepo = new UserRepo()
            const flag = await userRepo.userExists(uid)
            if(!flag) {
                return res.status(400).send({
                    message: 'No user exists',
                })
            }
            const postIds = await postRepo.getNewsFeed(uid, viewedPostIds);
            res.send({ postIds })
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }

    async fetchPostsByIds(req, res) {
        try {
            if(req.query.ids == undefined) {
                return res.send([])
            }
            const postIds = JSON.parse(req.query.ids)
            const postRepo = new PostRepo()
            const posts = await postRepo.getPostsByIds(postIds)
            res.send(posts)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }
}

export default new FeedController()