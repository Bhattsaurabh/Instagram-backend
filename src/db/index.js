import mongoose from "mongoose";
import { DB_NAME } from "../constant.js"

import express from "express"

const app = express()



const connectDB = async()   =>  {
try {
       const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`\n MongoDB connected !! DB HOST: 
        ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("MONGODB connection Error", error)
        process.exit(1)
    }
}


export default connectDB
