import {v2 as cloudinary} from "cloudinary"
import fs from "fs"     //file system
import dotenv from "dotenv"


dotenv.config({
    path: './.env'
})


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.CLOUDINARY_API_SECRET
});