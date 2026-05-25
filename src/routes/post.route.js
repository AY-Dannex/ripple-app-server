import { Router } from "express";
import { createPost, deletePost, updatePost, getAllPost, getUserPost } from "../controllers/post.controller.js";
import upload from "../middleware/upload.middleware.js";
import protect from "../middleware/auth.middleware.js";

const router = Router()

router.route('/create', ).post(protect, upload.array("images", 4), createPost)
router.route('/update/:id', ).patch(protect, updatePost)
router.route('/delete/:id', ).delete(protect, deletePost)
router.route('/', ).get(protect, getAllPost)
router.route('/user', ).get(protect, getUserPost)

export default router