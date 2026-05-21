import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";


const cookieOptions = {
    httpOnly: true,
    secure: true,      // Must be true for cross-site
    sameSite: "none"   // REQUIRED for cross-site cookies
};


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken(); // Keep your exact spelling
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while generating tokens");
    }
}   

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

const loginUser=asyncHandler(async(req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
        throw new ApiError(400,"All fields required");
    }
    const user = await User.findOne({ email }).select("+password");

    if(!user)throw new ApiError(400,"User not found");
    console.log(user);
    const isPasswordValid=await user.isPasswordCorrect(password);
    if(!isPasswordValid)throw new ApiError(400,"User Credentials incorrect");
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
    const createdUser=await User.findById(user._id);

    return res.status(200)
    .cookie("accessToken",accessToken,cookieOptions)
    .cookie("refreshToken",refreshToken,cookieOptions)
    .json(
        new ApiResponse(200,{user: createdUser,
                accessToken,
                refreshToken},"User Logged In Successfully")
    )
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    
    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User Logged Out"))
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)
    
        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200, 
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    
    // ✅ FIXED: Must select +password here too!
    const user = await User.findById(req.user?._id).select("+password");
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
});

export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword};