import {Router} from 'express'
import {verifyJWT} from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'

import {createComment,
        updateComment,
        deleteComment,
        getComment
    } from '../controllers/comment.controller.js'



const router = Router()

router.route("/create-comment/:Id").post(verifyJWT ,createComment) 
router.route("/update-comment/:commentId").patch(verifyJWT, updateComment)
router.route("/delete-comment/:commentId").delete(verifyJWT, deleteComment)
router.route("/get-comment/:commentId").get(verifyJWT, getComment)


export default router