
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { Reel } from '../models/reel.model.js'



const publishReel = asyncHandler(async(req, res) =>{


    try {
        if(!req.user?._id)
        {
             throw new ApiError(400, "unauthorized user")
        }
    
        const caption = req.body.caption
        
        let localVideoFile
    
        if(req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0)
        {
            localVideoFile = req.files.videoFile[0].path
        }
        let localthumbnail
        
        if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0)
        {
            localthumbnail = req.files.thumbnail[0].path
        }
    
        if(!localVideoFile || !localthumbnail)
        {
            throw new ApiError(400, "file and thumbnail are required")
        }
        //console.log("caption :", caption, "reel: ", localVideoFile, "thumbnail :", localthumbnail)

        const videoFileCloud  = await uploadOnCloudinary(localVideoFile)
        const thumbnailCloud  = await uploadOnCloudinary(localthumbnail)
        
        if(!videoFileCloud || !thumbnailCloud)
        {
            throw new ApiError(400, "failed to upload files")
        }
    
    
        const reel = await Reel.create({
            videoFile: videoFileCloud.url,
            thumbnail: thumbnailCloud.url,
            caption: caption ? caption : "",
            owner: req.user._id
        })
    
        if(!reel)
        {
            throw new ApiError(500, "Internal server error failed to publish reel")
        }
    
        return res
        .status(200)
        .json( new ApiResponse(200, reel, "Reel published successfully"))
    } catch (error) {
            throw new ApiError(400, error.message || "something went wrong failed to publish reel")
    }

})

const updateReel = asyncHandler(async(req, res) =>{


    try {
        if(!req.user?._id)
        {
            throw new ApiError(400, "unauthorized user")
        }
    
        const {reelId} = req.params
        if(!reelId)
        {
            throw new ApiError(400, "Reel not found")
        }
    
        const newCaption = req.body.caption
        const newThumbnailLocalPath = req.file?.path

        //console.log("reelId: ", reelId, "newCaption :", newCaption, "newthumbnail : ", newThumbnailLocalPath)
    
        if(!newCaption && !newThumbnailLocalPath)
        {
            throw new ApiError(400, "some updation required")
        }

        const thumbnailCloud = await uploadOnCloudinary(newThumbnailLocalPath)
    
        if(newThumbnailLocalPath && !thumbnailCloud)
        {
            throw new ApiError(400, "file not uploaded")
        }
    
        const checkUserandReel = await Reel.findOne({_id: reelId, owner: req.user._id})
    
        if(!checkUserandReel)
        {
            throw new ApiError(401, "unauthorized access user with this reel not found")
        }

        if(!newCaption)
            {
                newCaption = checkUserandReel.caption
            }
        if(!newThumbnailLocalPath)
            {
                newThumbnailLocalPath = checkUserandReel.thumbnail
            }
    
        const updatereel = await Reel.findByIdAndUpdate(
            {
                _id: reelId
            },
            {
                $set: {
                    thumbnail: thumbnailCloud ? thumbnailCloud.url : newThumbnailLocalPath,
                    caption: newCaption
                }
            },
            {
                new: true
            }
        )
    
        if(!updatereel)
        {
            throw new ApiError(500, "Internal server error failed to update reel")
        }
    
        return res
        .status(200)
        .json(new ApiResponse(200, updatereel, "Reel updated successfully"))
    } catch (error) {
        throw new ApiError(400, error.message || "something went wrong failed to update reel")
    }


})

const getReelById = asyncHandler(async(req, res)=>{

   try {
     if(!req.user?._id)
     {
         throw new ApiError(400, "unauthorized user")
     }
 
     const {reelId} = req.params
     if(!reelId)
     {
         throw new ApiError(400, "Reel not found")
     }
 
     const reel = await Reel.findOne({_id: reelId})
 
     if(!reel)
     {
         throw new ApiError(401, "Internal server error failed to get reel")
     }
 
     return res
     .status(200)
     .json( new ApiResponse(200, reel, "Reel fetched successfully"))
   } catch (error) {
        throw new ApiError(400, error.message || "something went wrong failed to get Reel"
        )
   }


})

const deleteReel = asyncHandler(async(req, res) =>{


   try {
     if(!req.user?._id)
     {
         throw new ApiError(400, "unauthorized user")
     }
 
     const {reelId} = req.params
     if(!reelId)
     {
         throw new ApiError(400, "Reel not found")
     }
 
     const checkUserandReel  =  await Reel.findOne({_id: reelId, owner: req.user._id})
 
     if(!checkUserandReel)
     {
         throw new ApiError(401, "unauthorized access user with this reel not found")
     }
 
 
     const deletereel = await Reel.findByIdAndDelete(reelId)
 
     if(!deletereel)
     {
         throw new ApiError(500, "Internal server error failed to delete reel")
     }
 
 
     return res
     .status(200)
     .json( new ApiResponse(200, deletereel, "Reel deleted successfully"))
   } catch (error) {
        throw new ApiError(400, error.message || "something went wrong failed to delete reel")
   }


})

export {publishReel, updateReel, getReelById, deleteReel}