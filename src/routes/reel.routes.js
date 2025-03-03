import {Router} from 'express'
import {upload} from '../middlewares/multer.middleware.js'
import {verifyJWT} from '../middlewares/auth.middleware.js'
import {
     publishReel,
     updateReel,
     getReelById,
     deleteReel
} from '../controllers/reel.controller.js'


const router = Router()

router.route("/publish-reel").post(verifyJWT, 
    upload.fields([
        {
            name: 'videoFile',
            maxCount: 1
        },
        {
            name: 'thumbnail',
            maxCount: 1
        }
    ]),
    publishReel
)

router.route("/update-reel/:reelId").patch(verifyJWT, upload.single('thumbnail'), updateReel)

router.route("/get-reel-By-Id/:reelId").get(verifyJWT, getReelById)

router.route("/delete-reel/:reelId").delete(verifyJWT, deleteReel)



export default router