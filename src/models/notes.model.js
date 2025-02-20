import mongoose from "mongoose";

const noteSchema = mongoose.Schema({

    note: {
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


    export const Note = mongoose.model("Note", noteSchema)