import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

//app.use is used for configuration or middleware

app.use(cors({                              // used to handle CORS => give permission to url 
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))                 // used for json data
app.use(express.urlencoded({extended: true, limit: "16kb"}))   // used for url data
app.use(express.static("public"))               // used for store public data like favicon, images and files
app.use(cookieParser())                     // read and set cookie in user's browser


import userRouter from './routes/user.routes.js'
import postRouter from './routes/post.routes.js'
import reelRouter from './routes/reel.routes.js'
import noteRouter from './routes/note.routes.js'
import commentRouter from './routes/comment.routes.js'
import likeRouter from './routes/like.routes.js'



app.use("/api/v1/users", userRouter)
app.use("/api/v1/posts", postRouter)
app.use("/api/v1/reels", reelRouter)
app.use("/api/v1/notes", noteRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)

export {app}