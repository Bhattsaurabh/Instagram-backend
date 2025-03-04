import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { Comment } from '../models/comment.model.js'
import {Post} from '../models/post.model.js'
import {Reel} from '../models/reel.model.js'



const createComment = asyncHandler(async (req, res) => {


    try {
        if (!req.user) {
            throw new ApiError(400, "unauthorized user")
        }

        const { Id } = req.params
        const { content } = req.body

        //console.log("ID: ", Id, "comment :", content)

        if (!Id) {
            throw new ApiError(400, "post not found")
        }

        if (!content || content.trim() === "") {
            throw new ApiError(400, "comment required")
        }

        const reelId = await Reel.findOne({_id: Id})
        const postId = await Post.findOne({_id: Id})

        //console.log(reelId);
        //console.log(postId);
        
        
        
        if(!reelId && !postId)
        {
            throw new ApiError(404, "post not exist")
        }

        const addComment = await Comment.create({
            content: content,
            reel: reelId ? reelId._id : null,
            post: postId ? postId._id : null,
            owner: req.user?._id
        })

        if (!addComment) {
            throw new ApiError(500, "Internal server error failed to add comment")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, addComment, "comment posted successfully"))
    } catch (error) {
        throw new ApiError(400, error.message || "something went wrong failed to post comment")
    }




})


const updateComment = asyncHandler(async (req, res) => {


    try {
        if (!req.user) {
            throw new ApiError(401, "unauthorized user")
        }

        const { commentId } = req.params
        if (!commentId) {
            throw new ApiError(404, "comment not found")
        }

        const newComment = req.body.content

       // console.log("commentId: ", commentId, "newcomment :", newComment);
        

        if (!newComment) {
            throw new ApiError(400, "some change in comment required")
        }


        const checkUserandComment = await Comment.findOne({ _id: commentId, owner: req.user?._id })

        if (!checkUserandComment) {
            throw new ApiError(404, "user with this comment not found")
        }

        const updatecomment = await Comment.findByIdAndUpdate( commentId,
            {
                $set: {
                    content: newComment
                }
            },
            {
                new : true
            }
        )

        if (!updatecomment) {
            throw new ApiError(500, "Internal server error failed to update comment")
            }

        return res
        .status(200)
        .json(new ApiResponse(200, updatecomment, "comment updated successfully"))
        } 
        catch (error) {
            throw new ApiError(400, error.message || "something went wrong failed to update comment")
        }



})


const deleteComment = asyncHandler(async(req, res)  =>{

    try {
        if(!req.user)
        {
            throw new ApiError(401, "unauthorized user")
        }
    
        const {commentId} = req.params
    
        if(!commentId)
        {
            throw new ApiError(404, "comment not found")
        }
    
        const checkUserandComment = await Comment.findOne({_id: commentId, owner: req.user?._id})
    
        if(!checkUserandComment)
        {
            throw new ApiError(404, "user with this comment not found")
        }
    
        const deletecomment = await Comment.findByIdAndDelete(commentId)
    
        if(!deletecomment)
        {
            throw new ApiError(500, "Internal server error failed to delete comment ")
        }
    
        return res
        .status(200)
        .json( new ApiResponse(200, deletecomment, "comment deleted successfully"))
    } catch (error) {
        throw new ApiError(400, error.message || "something went wrong failed to delete comment")
    }


})

const  getComment = asyncHandler(async(req, res) =>{

   try {
     const {commentId} = req.params
 
     if(!commentId)
     {
         throw new ApiError(404, "comment not found")
     }
 
     const comment = await Comment.findOne({_id: commentId})
 
     if(!comment)
     {
         throw new ApiError(500, "Internal server error failed to get comment")
     }
 
     return res
     .status(200)
     .json( new ApiResponse(200, comment, "Comment fetched successfully"))
   } catch (error) {
        throw new ApiError(400, error.message || "something went wrong failed to get comment")
   }



})



export {createComment, updateComment, deleteComment, getComment}