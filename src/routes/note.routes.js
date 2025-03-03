import {Router} from 'express'
import {verifyJWT} from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'
import { Note } from '../models/notes.model.js'
import {
        createNote,
        updateNote,
        getNotebyId,
        deleteNote
} from '../controllers/note.controller.js'


const router = Router()

router.route("/create-note").post(verifyJWT, upload.single('audio'), createNote)

router.route("/update-note/:noteId").patch(verifyJWT, upload.single('audio'), updateNote)

router.route("/get-note-by-Id/:noteId").get(verifyJWT, getNotebyId)

router.route("/delete-note/:noteId").delete(verifyJWT, deleteNote)



export default router

