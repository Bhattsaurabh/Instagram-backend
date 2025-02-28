
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { Post } from "../models/post.model.js";


const createPost = asyncHandler(async(req, res) =>{


    try {
        if(!req.user)
        {
            throw new ApiError(400, "unauthorized user")
        }
    
        const {caption} = req.body
        console.log(caption);
        
    
        let imageLocalPath
    
        if (req.files && Array.isArray(req.files.image) && req.files.image.length > 0) {
            imageLocalPath = req.files.image[0].path;
        }
    
        if(!imageLocalPath)
        {
                throw new ApiError(400, "Please upload a file")
        }
        
        console.log(imageLocalPath)
        

        let audioLocalPath
    
        if (req.files && Array.isArray(req.files.audio) && req.files.audio.length > 0) {
            audioLocalPath = req.files.audio[0].path;
        }
    
        const imageCloud = await uploadOnCloudinary(imageLocalPath)
        if(!imageCloud)
            {
                throw new ApiError(400, "failed to upload image try again")
            }
    
        const audioCloud = await uploadOnCloudinary(audioLocalPath)
    
        const newPost = await Post.create({
            image: imageCloud.url,
            caption: caption ? caption : "",
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

        const userId = req.user?._id
        if(!userId)
        {
            throw new ApiError(400, "unauthorized user")
        }
    
        const {postId} = req.params
        //console.log(postId);
        
    
        if(!postId)
        {
            throw new ApiError(400, "Post not found")
        }
    
        const newCaption = req.body.caption
        const newImageLocalPath = req.file?.path
        //console.log(newCaption);
        //console.log(newImageLocalPath);

        if(!newCaption && !newImageLocalPath)
        {
            throw new ApiError(401, "some updation required")
        }
    
        const imageCloud = await uploadOnCloudinary(newImageLocalPath)
    
        if(newImageLocalPath && !imageCloud)
        {
            throw new ApiError(400, "file not uploaded")
        }
    
        const checkUserandPost = await Post.findOne({_id: postId, owner: userId})
        //console.log(checkUserandPost)
        if(!checkUserandPost)
        {
            throw new ApiError(401, "Unauthorized access")
        }

        if(!newCaption)
        {
            newCaption = checkUserandPost.caption
        }
        if(!newImageLocalPath)
        {
            newImageLocalPath = checkUserandPost.image
        }
    
        const updatePost = await Post.findByIdAndUpdate(
            {
                _id: postId
            },
            {
                $set: {
                    image: imageCloud ? imageCloud.url : newImageLocalPath,
                    caption : newCaption
                }
            },
            {
                new: true
            }
            ).select("-password -refreshToken")
    
       // console.log(updatePost);
        
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
        if(!req.user?._id)
        {
            throw new ApiError(400, "unauthorized user")
        }
    
        const {postId} = req.params
    
        if(!postId)
        {
            throw new ApiError(400, "post not found")
        }
       // console.log(postId);
        
    
        const checkUserandPost = await Post.findOne({_id: postId, owner: req.user?._id })

       // console.log(checkUserandPost);
        if(!checkUserandPost)
        {
            throw new ApiResponse(400, "unauthorized access")
        }
    
        const deletePost = await Post.findByIdAndDelete(postId)
       // console.log(deletePost)
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

const getPostbyId = asyncHandler(async(req, res) =>{


    try {
        if(!req.user)
        {
            throw new ApiError(400, "unauthorized user")
        }
    
        const {postId} = req.params
        //console.log(postId);
        
        const post = await Post.findOne({_id: postId})
        
        //console.log(post);
        

        if(!post)
        {
            throw new ApiError(400, "post not found")
        }
    
        return res
        .status(200)
        .json( new ApiResponse(200, post, "Post fetched successfully"))
    
    } catch (error) {
        throw new ApiError(400, "something went wrong failed to fetch post")
    }

})


export {createPost, updatePost, deletePost, getPostbyId}
