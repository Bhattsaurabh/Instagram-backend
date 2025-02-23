
import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {upload} from '../middlewares/multer.middleware.js'
import {userRegister,
    loginUser,
     logoutUser,
       updateAccountDetails,
        updateAvatar,
         getCurrentUser,
           passwordChange
       } from '../controllers/user.controller.js'


const router  = Router()


router.route("/user-register").post(upload.single('avatar') ,userRegister)

router.route("/login-user").post(loginUser)

router.route("/logout-user").post(verifyJWT, logoutUser)

router.route("/update-avatar").patch( verifyJWT, upload.single('avatar'), updateAvatar)

router.route("/update-account-details").patch(verifyJWT, updateAccountDetails)

router.route("/get-current-user").get(verifyJWT, getCurrentUser)

router.route("/change-password").patch(verifyJWT, passwordChange)


export default router