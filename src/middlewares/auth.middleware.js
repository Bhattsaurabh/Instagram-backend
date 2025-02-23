import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";



const verifyJWT = asyncHandler(async (req, res, next) => {

    try {

        // mobileUser
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "unauthorized user")
        }

        // user k pass jo bhi token diya jata h wo encrypted hota h
        // usko DB wale refresh token se compare krne se pehle decode krna pdta h

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshtoken")

        if (!user) {
            throw new ApiError(401, "Invalid accessToken")
        }

        req.user = user
        next()


    } catch (error) {
        throw new ApiError(401, error.message || "Inavalid accessToken")
    }

})


export {verifyJWT}
