import express from "express";

import feedController from "../controllers/feed_controller.js";

const router = express.Router()

router.get('/', feedController.fetchNewsFeed)
router.get('/posts', feedController.fetchPostsByIds)

export default router