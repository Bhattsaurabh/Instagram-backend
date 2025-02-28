import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {upload} from '../middlewares/multer.middleware.js'
import {
    createPost,
    updatePost,
    deletePost,
    getPostbyId
} from '../controllers/post.controller.js' 



const router = Router()


router.route("/create-post").post(verifyJWT,
    upload.fields([
    {
        name: 'image',
        maxCount: 1
    },
    {
        name: 'audio',
        maxCount: 1
    }
]), createPost)

router.route("/update-post/:postId").patch(verifyJWT,upload.single('image'), updatePost)

router.route("/delete-post/:postId").delete(verifyJWT, deletePost)

router.route("/get-postbyId/:postId").get(verifyJWT, getPostbyId)





export default router