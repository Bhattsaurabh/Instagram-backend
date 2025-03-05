import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import {Post} from '../models/post.model.js'
import {Reel} from '../models/reel.model.js'
import { Like } from '../models/like.model.js'
import mongoose from 'mongoose'



const togglePostLike = asyncHandler(async(req, res) =>{

   try {
     if(!req.user)
     {
         throw new ApiError(401, "unauthorized user")
     }
 
     const {postId} = req.params
 
     if(!postId)
     {
         throw new ApiError(404, "post not found")
     }
 
     const isLiked = await Like.findOne({post: postId, owner: req.user?._id})
 
 
     const response = isLiked 
                      ?  await Like.deleteOne({post: postId, owner: req.user?._id})  
                      :  await Like.create({ post: postId, owner: req.user?._id })
 
 
     if(!response)
     {
         throw new ApiError(500, "Internal server error failed to toggle like button")
     }
 
     return res
     .status(200)
     .json( new ApiResponse(200, response, "Post liked successfully"))
   } catch (error) {
        throw new ApiError(400, error.message || "something went wrong failed to toggle like button")
   }


})

const toggleReelLike = asyncHandler(async(req, res) =>{

    try {
      if(!req.user)
      {
          throw new ApiError(401, "unauthorized user")
      }
  
      const {reelId} = req.params
  
      if(!reelId)
      {
          throw new ApiError(404, "reel not found")
      }
  
      const isLiked = await Like.findOne({reel: reelId, owner: req.user?._id})
  
  
      const response = isLiked 
                       ?  await Like.deleteOne({reel: reelId, owner: req.user?._id})  
                       :  await Like.create({ reel: reelId, owner: req.user?._id })
  
  
      if(!response)
      {
          throw new ApiError(500, "Internal server error failed to toggle like button")
      }
  
      return res
      .status(200)
      .json( new ApiResponse(200, response, "Reel liked successfully"))
    } catch (error) {
         throw new ApiError(400, error.message || "something went wrong failed to toggle like button")
    }
 
 })

 const toggleNoteLike = asyncHandler(async(req, res) =>{

    try {
      if(!req.user)
      {
          throw new ApiError(401, "unauthorized user")
      }
  
      const {noteId} = req.params
  
      if(!noteId)
      {
          throw new ApiError(404, "note not found")
      }
  
      const isLiked = await Like.findOne({note: noteId, owner: req.user?._id})
  
  
      const response = isLiked 
                       ?  await Like.deleteOne({ note: noteId, owner: req.user?._id })  
                       :  await Like.create({ note: noteId, owner: req.user?._id })
  
  
      if(!response)
      {
          throw new ApiError(500, "Internal server error failed to toggle like button")
      }
  
      return res
      .status(200)
      .json( new ApiResponse(200, response, "Note liked successfully"))
    } catch (error) {
         throw new ApiError(400, error.message || "something went wrong failed to toggle like button")
    }
 
 })

 const getLikedPost = asyncHandler(async(req, res) => {

    try {
        const userId = req.user?._id
    
        if(userId)
        {
            throw new ApiError(401, "unauthorized user")
        }
    
        const pipeline = [
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "Post",
                    localField: "post",
                    foreignField: "_id",
                    as : "posts",
                    pipeline: [
                        {
                            from: "User",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                            username: 1,
                                            email: 1,
                                            avatar: 1
                                    }
                                }
                            ]
                        },
                        {
                            $addFields:{
                                postOwner: {
                                    $first: "$owner"
                                }
                            }
                        },
                        {
                            $addFields:{
                                post: "$image.url"
                            }
                        },
                        {
                            $addFields:{
                                caption : "$caption"
                            }
                        }
                    ]
                }
            }
        ]
        
        const likedPosts = await Like.aggregate(pipeline)
    
        if(!likedPosts)
        {
            throw new ApiError(500, "Internal server error failed to fetch liked posts")
        }
    
        return res
        .status(200)
        .json(new ApiResponse(200, likedPosts, "Liked posts fetched successfully"))
    } catch (error) {
        throw new ApiError(400, error.message || "something went wrong failed to load liked posts")
    }

 })


 const getLikedReel = asyncHandler(async(req, res) => {

    try {
        const userId = req.user?._id
    
        if(userId)
        {
            throw new ApiError(401, "unauthorized user")
        }
    
        const pipeline = [
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "Reel",
                    localField: "reel",
                    foreignField: "_id",
                    as : "reels",
                    pipeline: [
                        {
                            from: "User",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                            username: 1,
                                            email: 1,
                                            avatar: 1
                                    }
                                }
                            ]
                        },
                        {
                            $addFields:{
                                reelOwner: {
                                    $first: "$owner"
                                }
                            }
                        },
                        {
                            $addFields:{
                                videoFile: "$videoFile.url"
                            }
                        },
                        {
                            $addFields:{
                                thumbnail: "$thumbnail.url"
                            }
                        },
                        {
                            $addFields:{
                                caption : "$caption"
                            }
                        }
                    ]
                }
            }
        ]
        
        const likedReels = await Like.aggregate(pipeline)
    
        if(!likedReels)
        {
            throw new ApiError(500, "Internal server error failed to fetch liked reels")
        }
    
        return res
        .status(200)
        .json(new ApiResponse(200, likedReels, "Liked reels fetched successfully"))
    } catch (error) {
        throw new ApiError(400, error.message || "something went wrong failed to load liked reels")
    }

 })


 export {togglePostLike, toggleReelLike, toggleNoteLike, getLikedPost, getLikedReel}
