import {Router} from 'express'
import {verifyJWT} from '../middlewares/auth.middleware.js'

import {
        togglePostLike,
        toggleReelLike,
        toggleNoteLike,
        getLikedPost,
        getLikedReel

} from '../controllers/like.controller.js'


const router = Router()

router.route("/toggle-post-like/:postId").patch(verifyJWT, togglePostLike)

router.route("/toggle-reel-like/:reelId").patch(verifyJWT, toggleReelLike)

router.route("/toggle-note-like/:noteId").patch(verifyJWT, toggleNoteLike)

router.route("/get-liked-posts").get(verifyJWT, getLikedPost)

router.route("/get-liked-reels").get(verifyJWT, getLikedReel)



export default router