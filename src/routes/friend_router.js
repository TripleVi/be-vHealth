import express from "express";

import friendController from "../controllers/friend_controller.js";

const router = express.Router()

router.get('/followings/:id', friendController.getFollowings)
router.get('/followings/:id/count', friendController.countFollowings)
router.get('/followers/:id', friendController.getFollowers)
router.get('/followers/:id/count', friendController.countFollowers)
router.post('/', friendController.followFriend)
router.delete('/:id', friendController.unfollowFriend)

export default router