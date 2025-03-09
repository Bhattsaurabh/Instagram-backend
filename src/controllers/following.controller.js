import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { Following } from '../models/following.model.js'
import mongoose, { mongo } from 'mongoose'


const toggleFollow = asyncHandler(async(req, res)   =>{


   try {
     const userId = req.user._id
     const {instaId} = req.params

     //console.log("userID: ", userId, "instaID :", instaId);
     
 
     if(!userId)
     {
         throw new ApiError(401, "unauthorized user")
     }
 
     if(!instaId)
     {
         throw new ApiError(404, "account not found")
     }
 
 
     const isFollowing = await Following.findOne({follower: userId, following: instaId})
 
     const response = isFollowing ?
                      await Following.deleteOne({follower: userId, following: instaId})
                   :  await Following.create({follower: userId, following: instaId})
 
     
     return res
     .status(200)
     .json( new ApiResponse( 200, response, isFollowing === null ? "follow request sended successfully" 
                             : "account unfollow successfully"))
   } catch (error) {
        throw new ApiError(400, error.message || "something went wrong your request failed")
   }


})


const getFollowersAccounts = asyncHandler(async(req, res)  =>{

    const userId = req.user?._id
    const {instaId} = req.params

    if(!userId)
    {
        throw new ApiError(401, "unauthorized user")
    }
    if(!userId)
    {
        throw new ApiError(404, "account not found")
    }

    const pipeline = [
        {
            $match: {
                following: new mongoose.Types.ObjectId(instaId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "follower",
                foreignField: "_id",
                as: "followers",
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


    const response = await Following.aggregate(pipeline)

    return res
    .status(200)
    .json( new ApiResponse(200, response, "Followers fetched successfully"))



})

const getFollowingAccounts = asyncHandler(async(req, res)  =>{

    const userId = req.user?._id

    if(!userId)
    {
        throw new ApiError(401, "unauthorized user")
    }

    const pipeline = [
        {
            $match: {
                follower: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "following",
                foreignField: "_id",
                as: "followings",
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


    const response = await Following.aggregate(pipeline)

    return res
    .status(200)
    .json( new ApiResponse(200, response, "Following fetched successfully"))



})



export { toggleFollow, getFollowersAccounts, getFollowingAccounts }