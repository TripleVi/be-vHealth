import express from "express";

import postController from "../controllers/post_controller.js";

const router = express.Router()

router.delete('/:id', postController.deleteComment)

export default router