import mongoose from "mongoose";

const followSchema = mongoose.Schema({

    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}
    
    ,{timestamps: true})


    export const Following = mongoose.model("Following", followSchema)