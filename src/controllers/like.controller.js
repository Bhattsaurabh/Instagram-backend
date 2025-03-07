import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import {Post} from '../models/post.model.js'
import {Reel} from '../models/reel.model.js'
import { Like } from '../models/like.model.js'
import mongoose, { mongo } from 'mongoose'



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
 
     const isLiked = await Like.findOne({post: postId, likedBy: req.user?._id})
 
 
     const response = isLiked ? 
                         await Like.deleteOne({post: postId, likedBy: req.user?._id})  
                        : await Like.create({ post: postId, likedBy: req.user?._id })
 
 
     if(!response)
     {
         throw new ApiError(500, "Internal server error failed to toggle like button")
     }
 
     return res
     .status(200)
     .json( new ApiResponse(200, response, isLiked === null ? "Post liked successfully" : "Post disliked successfully"))
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
  
      const isLiked = await Like.findOne({reel: reelId, likedBy: req.user?._id})
  
  
      const response = isLiked 
                       ?  await Like.deleteOne({reel: reelId, likedBy: req.user?._id})  
                       :  await Like.create({ reel: reelId, likedBy: req.user?._id })
  
  
      if(!response)
      {
          throw new ApiError(500, "Internal server error failed to toggle like button")
      }
  
      return res
      .status(200)
      .json( new ApiResponse(200, response, isLiked === null ? "Reel liked successfully" : "Reel disliked successfully"))
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
  
      const isLiked = await Like.findOne({note: noteId, likedBy: req.user?._id})
  
  
      const response = isLiked 
                       ?  await Like.deleteOne({ note: noteId, likedBy: req.user?._id })  
                       :  await Like.create({ note: noteId, likedBy: req.user?._id })
  
  
      if(!response)
      {
          throw new ApiError(500, "Internal server error failed to toggle like button")
      }
  
      return res
      .status(200)
      .json( new ApiResponse(200, response, isLiked === null ? "Note liked successfully" : "Note disliked successfully" ))
    } catch (error) {
         throw new ApiError(400, error.message || "something went wrong failed to toggle like button")
    }
 
 })

 const getLikedPost = asyncHandler(async(req, res) => {

    try {
        const userId = req.user?._id
       // console.log(userId);
        
    
        if(!userId)
        {
            throw new ApiError(401, "unauthorized user")
        }
    
        const pipeline = [
                {
                    $match: {
                       $and: [
                         { 
                            likedBy: new mongoose.Types.ObjectId(userId)  
                          },
                         {
                           post: {
                              $exists: true
                           } 
                         }
                       ]
                    }
                },
                {
                    $lookup: {
                        from : "posts",
                        localField: "post",
                        foreignField: "_id",
                        as: "posts",
                        pipeline: [
                            {
                                $project:{
                                    image: 1,
                                    caption:1,
                                    audio:1
                                }
                            },
                            
                        ]
                    }
                },
                {
                    $lookup: {
                        from : "users",
                        localField: "likedBy",
                        foreignField: "_id",
                        as: "postedBy",
                        pipeline: [
                            {
                                $project:{
                                    username: 1,
                                    avatar:1
                                }
                            },
                            
                        ]
                    }

                }
               
                  
        
        ]
        
        const likedPosts = await Like.aggregate(pipeline)
       // console.log(likedPosts);
        
    
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
    
        if(!userId)
        {
            throw new ApiError(401, "unauthorized user")
        }
    
        const pipeline = [
            {
                $match: {
                    $and:[
                        {
                            likedBy: new mongoose.Types.ObjectId(userId)
                        },
                        {
                            reel : {
                                $exists: true
                            }
                        }

                    ]
                }
            },
            {
                $lookup: {
                    from: "reels",
                    localField: "reel",
                    foreignField: "_id",
                    as : "reels",
                    pipeline: [
                        {
                            $project: {
                                    videoFile: 1,
                                    thumbnail: 1,
                                    caption: 1,
                                    audio: 1
                                }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "likedBy",
                    foreignField: "_id",
                    as : "postedBy",
                    pipeline: [
                        {
                            $project: {
                                    username: 1,
                                    avatar: 1
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
