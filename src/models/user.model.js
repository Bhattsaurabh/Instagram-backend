import mongoose from "mongoose"


const userSchema = mongoose.Schema( {
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    avatar: {
        type: String,       // cloudinary se string lenge
        required: true
    }

},

    {timestamps: true}
)


export const User = mongoose.model("User", userSchema)