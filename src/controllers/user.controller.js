import {asyncHandler} from '../utils/asyncHandler.js'
import {apiError} from '../utils/ApiError.js'
import {apiResponse} from '../utils/ApiResponse.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {User} from '../models/user.model.js'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

const generateAccessandRefreshTokens = async(userId) =>{

   try {
     const user = await User.findbyId(userId)
     const accessToken = user.generateAccessToken()
     const refreshToken = user.generaterefreshToken()
 
     user.refreshToken = refreshToken
 
     await user.save({ validateBeforesave: false })     //saving refreshtoken in user db
 
     return {accessToken, refreshToken}
 
   } catch (error) {
        throw new apiError(500, "something went wrong while generating accessToken and refreshToken")
   }

}

const userRegister = asyncHandler(async(req, res)   =>{

    // get user details from frontend
    // validation   -   not empty
    // check if user is already exists: username, email
    // check for images, and avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return response

    try {
        const {username, email, password}  = req.body
    
        if(!username || username.trim() === "" || !email || email.trim() === "" || !password || password.trim() === "") 
        {
            throw new apiError(400, "All fields are required")
        }
    
        if(req.body.email.indexof('@') == -1)
        {
            throw new apiError(401, "Email is not valid")
        }
    
        const checkUser = await User.findOne({
            $or: [{username}, {email}]
        })
    
        if(checkUser)
        {
            throw new apiError(400, "User is already registered")
        }
    
        let avatarLocalPath
        if(req.files)
        {
            avatarLocalPath = req.files?.path 
        }
    
        const avatarCloud = await uploadOnCloudinary(avatarLocalPath)
    
        const user = await User.create({
            username: username.toLowercase(),
            email: email,
            avatar: avatarCloud === null ? "": avatarCloud.url,
            password: password
        })
    
        const createdUser = await User.findbyId(user._id).select("-password -refreshToken")
    
        if(!createdUser)
        {
            throw new apiError(500, "Internal server error failed to create user")
        }
    
        return res
        .status(200)
        .json( new apiResponse(200, createdUser, "User registered successfully"))
    
    
    } catch (error) {
        throw new apiError(500, error.message || "Something went wrong failed to create user")
    }





})

const loginUser = asyncHandler(async(req, res)  =>{
    
    // req body -> data
    // username or email
    // find the user
    // verify user is there or not
    // check password
    // access and refresh token
    // send cookie


   try {
     const {username, email, password} = req.body
 
     if(!username && !email)
     {
         throw new apiError(400, "username or email is required")
     }
 
     if(!password)
     {
         throw new apiError(400, "password is required")
     }
 
     const user = await User.findOne({
         $or: [{username}, {email}]
     })
 
     if(!user)
     {
         throw new apiError(400, "Invalid user")
     }
 
     const checkValidPassword = await user.isPasswordCorrect(password)
 
     if(!checkValidPassword)
     {
         throw new apiError(500,"Invalid Password")
     }
 
      // getting accesstoken and refreshtoken
     // accesstoken => user ko login krte time accesstoken provide kiya jata h for a fixed time.
     // refreshtoken => accesstoken expire hone k baad user ko bina dubara login kraye refreshtoken se user ko login rkha jata h agr
     // user ka refreshtoken DB k refreshtoken se match hogya.
 
     const{accessToken, refreshToken} = await generateAccessandRefreshTokens(user._id)
 
     const loggedInUser = await User.findbyId(user._id).select("-password -refreshToken" )
 
     // sending cookies
     const options = {
         httpOnly: true,         // cookie only manage by server
         secure: true
     }
 
     return res 
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", accessToken, options)
     .json( new apiResponse(200, {user: loggedInUser, accessToken, refreshToken},
              "User logged in successfully" ))
   } catch (error) {
        throw new apiError(500, error.message || "something went wrong try again to log in")
   }



})

// logout user
// logout karne k liye user ko jo login pr tokens diye wo sb clear karne honge.
// user ko logout karne k liye user ka access lena pdega tabhi toh accesstoken and refreshtoken hatayenge
// issliye ye middleware ka use krk logout method par jane se pehle req mai req.user ko add krdenge jisme  access and refresh tokens honge.


const logoutUser = asyncHandler(async(req, res) => {

    await User.findbyIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json( new apiResponse(200, {}, "user logout successfully")) 

})


// jab user ka accesstoken expire hojyga then usko dubara login na krne k liye uska refreshtoken verify krenge
// login pe user ko jo refreshtoken diya h usko DB mai save wale se verify krenge.
// user ko diya hua koi b token encoded hota h or DB mai decoded m hota h

const refreshAccessToken = asyncHandler( async(req, res) =>{

    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
        if(!incomingRefreshToken)
        {
            throw new apiError(400, "unauthorized request")
        }
    
        const decodedToken =  jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findbyId(decodedToken._id)
    
        if(!user)
        {
            throw new apiError(401, "Invalid refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken)
        {
            throw new apiError(401, "refreshToken is expired or used")
        }
    
        const {accessToken, newrefreshToken } = await generateAccessandRefreshTokens(user._id)
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json( new apiResponse(200, {accessToken, newrefreshToken}, "access token refreshed"))
    
    
    } catch (error) {
        throw new apiError(400, error.message || "failed to refresh token")
    }

})


// password change

const passwordChange  = asyncHandler(async(req, res) =>{

   try {
     const {oldPassword, newPassword} = req.body
 
     const user = await User.findbyId(req.user?._id)
 
     if(!user)
     {
         throw new apiError(500, "user not found")
     }
 
     const checkValidPassword = await user.isPasswordCorrect(oldPassword)
 
     if(!checkValidPassword)
     {
         throw new apiResponse(500, "Incorrect Password")
     }
 
     user.password = newPassword
     await user.save({validateBeforesave: false})
 
     return res
     .status(200)
     .json(new apiResponse(200, {}, "Password change successfully"))
 
   } catch (error) {
        throw new apiError(400, error.message || "Something went wrong failed to change password")
   }

    
})


// update avatar

const updateAvatar = asyncHandler(async(req, res)   =>{

    try {
        const localPath= req.files?.path
        const user = req.user
    
        if(!localPath)
        {
            throw new apiError(400,"Files is required")
        }
        if(!user)
            {
                throw new apiError(400,"unauthorized user")
            }
    
        const response = await uploadOnCloudinary(localPath)
    
        if(!response)
        {
            throw new apiError(401, "Failed to upload file try again")
        }
        const avatarCloudPath = response?.url
        const updateavatar = await User.findbyIdAndUpdate(user?._id,
            {
                $set:{
                    avatar: avatarCloudPath
                }
            },
            {
                new: true
            }
        ).select("-password -refreshToken")

        return res
        .status(200)
        .json(new apiResponse(200, {updateavatar}, "avatar successfully updated"))


    } catch (error) {
        throw new apiError(400, error.message || "something went wrong failed to update avatar")
    }



})


// getting current user details
const getCurrentUser = asyncHandler( async(req, res) =>{

    return res
    .status(200)
    .json( new ApiResponse(200, req.user, "Current user fetched successfully"))
    
})


// update account details

const updateAccountDetails = asyncHandler(async(req, res) =>{

    try {
        const {updateDetails} = req.body
        const user = req.user
    
        if(!updateDetails)
        {
            throw new apiError(400, "something need to be updated")
        }
        if(!user)
        {
            throw new apiError(400, "unauthorized user")
        }
    
        const updatedAccount = User.findbyIdAndUpdate(user?._id,
            {
                $set: updateDetails
            },
            {
                new: true
            }
        ).select("-password -refreshToken")
    
    
        return res
        .status(200)
        .json( new apiResponse(200, updatedAccount, "user account updated successfully"))
    
    } catch (error) {
        throw new apiError(400, error.message || "something went wrong failed to update account details")
    }

})