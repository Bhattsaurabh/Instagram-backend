
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



const updatePost = asyncHandler(async(req,res)  =>{


    try {
        if(!req.user)
        {
            throw new ApiError(400, "unauthorized user")
        }
    
        const postId = req.params
    
        if(!postId)
        {
            throw new ApiError(400, "Post not found")
        }
    
        const newCaption = req.body
        const newImageLocalPath = req.file?.path
    
        if(!newCaption && !newImageLocalPath)
        {
            throw new ApiError(401, "some updation required")
        }
    
        const imageCloud = await uploadOnCloudinary(newImageLocalPath)
    
        if(newImageLocalPath && !imageCloud)
        {
            throw new ApiError(400, "file not uploaded")
        }
    
        const checkUserandPost = await Post.findOne({
            _id: postId,
            owner: req.user._id
        })
    
        if(!checkUserandPost)
        {
            throw new ApiError(401, "Unauthorized access")
        }
    
        const updatePost = await Post.findByIdAndUpdate({
            postId,
            image: imageCloud ? imageCloud.url : Post.image,
            caption: newCaption ? newCaption : Post.caption,
        }).select("-password -refreshToken")
    
    
        if(!updatePost)
        {
            throw new ApiError(500, "Internal server error failed to update post")
        }
    
        return res
        .status(200)
        .json( new ApiResponse(200, updatePost, "Post successfully updated"))
    
    } catch (error) {
         throw new ApiError(400, error.message || "something went wrong failed to update post")
    }


})

const deletePost = asyncHandler(async(req,res)  =>{

    try {
        if(!req.user)
        {
            throw new ApiError(400, "unauthorized user")
        }
    
        const postId = req.params
    
        if(!postId)
        {
            throw new ApiError(400, "post not found")
        }
    
    
        const checkUserandPost = await Post.findOne({
            _id: postId,
            owner: req.user?._id
        })
    
        if(!checkUserandPost)
        {
            throw new ApiResponse(400, "unauthorized access")
        }
    
        const deletePost = await Post.findByIdAndDelete(postId)
    
        if(!deletePost)
        {
            throw new ApiError(500, "Internal server error failed to delete the post")
        }
    
        return res
        .status(200)
        .json( new ApiResponse(200, deletePost,"Post deleted successfully"))
    } catch (error) {
         throw new ApiError(400, error.message || "Something went wrong failed to delete post"
         )
    }


})