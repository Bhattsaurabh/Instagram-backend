import mongoose from "mongoose";

const reelSchema = mongoose.Schema({

    videoFile: {
            type: String,       //cloudinary se
            required: true
        },
    thumbnail: {
        type: String,           //cloudinary se
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


    export const Reel = mongoose.model("Reel", reelSchema)