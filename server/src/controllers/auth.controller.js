import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

const registerUser=asyncHandler(async(req,res)=>{
    const {name,email,password}=req.body;
    if([name,email,password].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required");
    }

    const existUser=await User.findOne({
        $or:[{email}]
    })
    if(existUser)throw new ApiError(400,"User Already Exists");

    const profilePicLocalPath=req.files?.profilePic?.[0]?.path;
    if(!profilePicLocalPath){
        throw new ApiError(400,"Image Required");
    }
    const image=await uploadOnCloudinary(profilePicLocalPath);
    if(!image){
        throw new ApiError(400,"cloudinary_issue");
    }
    const user= await User.create({
        name,
        email,
        password,
        profilePic:image.secure_url,
    })

    const createdUser=await User.findById(user._id);
    if(!createdUser){
        throw new ApiError(400,"User not created");
    }
    return res.status(201).json(new ApiResponse(201,createdUser,"User Created Successfully"));
})

export {registerUser};