import mongoose from "mongoose";

const postSchema = mongoose.Schema({

    image: 
        {
            type: String,       //cloudinary se
            required: true
        },
    caption: {
        type: String
    },
    audio: {
        type: String
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: false
    }

}
    
    ,{timestamps: true})


    export const Post = mongoose.model("Post", postSchema)