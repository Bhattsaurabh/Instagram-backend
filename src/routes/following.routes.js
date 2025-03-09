
import {Router} from 'express'
import {verifyJWT} from '../middlewares/auth.middleware.js'
import { toggleFollow,
        getFollowersAccounts,
        getFollowingAccounts

}  from '../controllers/following.controller.js'


const router  = Router()

router.route("/toggle-follow-button/:instaId").patch(verifyJWT, toggleFollow)

router.route("/get-followers/:instaId").get(verifyJWT, getFollowersAccounts)

router.route("/get-following").get(verifyJWT, getFollowingAccounts)



export default router