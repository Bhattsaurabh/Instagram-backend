import mongoose from "mongoose";

const likeSchema = mongoose.Schema({

    reel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reel"
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    note: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note"
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: false
    }

}
    
    ,{timestamps: true})


    export const Like = mongoose.model("Like", likeSchema)