import express from "express";

import upload from "../middlewares/file_upload.js";
import postController from "../controllers/post_controller.js";

const router = express.Router()

router.get('/', postController.fetchPosts)
router.get('/:id/likes', postController.countPostLikes)
router.get('/:id/comments', postController.countPostComments)
router.post('/:id/likes', postController.likePost)
router.post('/:id/comments', postController.createComment)
router.post('/', postController.createPost)
router.post('/:id/photos', upload, postController.uploadPostFiles)
router.delete('/:id/likes', postController.unlikePost)
router.delete('/:id', postController.deletePost)

export default router