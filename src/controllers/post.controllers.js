
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { Post } from "../models/post.model";
import { User } from "../models/user.model";


const createPost = asyncHandler(async(req, res) =>{


    try {
        if(!req.user)
        {
            throw new ApiError(400, "unauthorized user")
        }
    
        const {caption} = req.body()
    
        let imageLocalPath
    
        if (req.files && Array.isArray(req.files.image) && req.files.image.length > 0) {
            imageLocalPath = req.files.imageLocalPath[0].path;
        }
    
        if(!imageLocalPath)
        {
                throw new ApiError(400, "Please upload a file")
        }
    
        let audioLocalPath
    
        if (req.files && Array.isArray(req.files.audio) && req.files.audio.length > 0) {
            audioLocalPath = req.files.audioLocalPath[0].path;
        }
    
        const imageCloud = await uploadOnCloudinary(imageLocalPath)
        if(!imageCloud)
            {
                throw new ApiError(400, "failed to upload image try again")
            }
    
        const audioCloud = await uploadOnCloudinary(audioLocalPath)
    
        const newPost = await Post.create({
            image: imageCloud.url,
            caption: caption ? caption : " ",
            audio: audioCloud ? audioCloud.url : "",
            owner: req.user._id 
        })
    
        if(!newPost)
        {
            throw new ApiError(500, "Internal server error failed to create this post")
        }
    
    
        return res
        .status(200)
        .json(new ApiResponse(200, newPost, "Post successfully published"))
    
    
    } catch (error) {
         throw new ApiError(400, error.message || "something went wrong failed to create post")
    }


})
