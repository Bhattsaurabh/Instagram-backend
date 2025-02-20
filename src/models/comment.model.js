import mongoose from "mongoose";

const commentSchema = mongoose.Schema({

    content: {
        type: String,
        required: true
    },

    reel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reel"
    },

    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}
    
    ,{timestamps: true})


    export const Comment = mongoose.model("Comment", commentSchema)