import {asyncHandler} from '../utils/asyncHandler.js'
import {apiError} from '../utils/ApiError.js'
import {apiResponse} from '../utils/ApiResponse.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {User} from '../models/user.model.js'
import {verifyJWT} from '../middlewares/auth.middleware.js'
import mongoose from 'mongoose'

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