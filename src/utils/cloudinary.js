import {v2 as cloudinary} from "cloudinary"
import fs from "fs"     //file system
import dotenv from "dotenv"
import { asyncHandler } from "./asyncHandler";
import { ApiError } from "./ApiError";


dotenv.config({
    path: './.env'
})


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async(localPath) =>{


    try {
        if(!localPath)
        {
            return null
        }
    
        const response = await cloudinary.uploader.upload(localPath, {
                resource_type: "auto"
            })
        
        fs.unlink(localPath)
    
        if(!response)
        {
            throw new ApiError(400, "something went wrong failed to upload file")
        }
    
        return response
    } catch (error) {
        throw new ApiError(500, "Internal server error failed to upload file")
    }


}

export {uploadOnCloudinary}