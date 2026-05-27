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

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if ([name, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existUser = await User.findOne({
        $or: [{ email }]
    })
    if (existUser) throw new ApiError(400, "User Already Exists");

    const profilePicLocalPath = req.files?.profilePic?.[0]?.path;
    if (!profilePicLocalPath) {
        throw new ApiError(400, "Image Required");
    }
    const image = await uploadOnCloudinary(profilePicLocalPath);
    if (!image) {
        throw new ApiError(400, "cloudinary_issue");
    }
    const user = await User.create({
        name,
        email,
        password,
        profilePic: image.secure_url,
    })

    const createdUser = await User.findById(user._id);
    if (!createdUser) {
        throw new ApiError(400, "User not created");
    }
    return res.status(201).json(new ApiResponse(201, createdUser, "User Created Successfully"));
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "All fields required");
    }
    const user = await User.findOne({ email }).select("+password");

    if (!user) throw new ApiError(400, "User not found");
    console.log(user);
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(400, "User Credentials incorrect");
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const createdUser = await User.findById(user._id);

    return res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, {
                user: createdUser,
                accessToken,
                refreshToken
            }, "User Logged In Successfully")
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

const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-blockedUsers -__v");
    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(new ApiResponse(200, user, "User Details"));

});

const updateProfile = asyncHandler(async (req, res) => {
    const { name, bio, status } = req.body


    const updates = {}
    if (name) updates.name = name.trim()
    if (bio !== undefined) updates.bio = bio
    if (status) updates.status = status

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No fields provided to update")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
    ).select("-__v -blockedUsers -friendRequests")

    return res.status(200).json(new ApiResponse(200, { user }, "Profile updated successfully"))
});

const searchUser = asyncHandler(async (req, res) => {
    const { userId } = req.query;
    if (!userId) throw new ApiError(400, "UserId is required");
    const user = await User.findOne({
        $or: [{ userId }]
    }).select("name userId profilePic bio")

    if (user._id.equals(req.user._id)) {
        throw new ApiError(400, "You can't add yourself")
    }
    if (!user) throw new ApiError(404, "User not found");
    return res.status(200).json(new ApiResponse(200, { user }, "Search Results"));
});

const checkFriendRequestsRecieved = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("friendRequests.received").populate("friendRequests.received.user", "name userId profilePic bio");
    if (!user) throw new ApiError(500, "Internal Issue");

    return res.status(200).json(new ApiResponse(200, user.friendRequests.received, "All Friend Request Received"))
});

const checkFriendRequestsSent = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("friendRequests.sent").populate("friendRequests.sent.user", "name userId profilePic bio");
    if (!user) throw new ApiError(500, "Internal Issue");

    return res.status(200).json(new ApiResponse(200, user.friendRequests.sent, "All Friend Request Received"))
});

const sendFriendRequest = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) throw new ApiError(400, "userId is required");

    const targetUser =await User.findOne({ userId });
    if (!targetUser) throw new ApiError(404, "User not found");

    if (targetUser._id.equals(req.user._id)) {
        throw new ApiError(400, "You can't send a friend request to yourself");
    }

    const currentUser = await User.findById(req.user._id);
    if (!currentUser) throw new ApiError(500, "Internal Issue");

    const alreadyFriends = currentUser.friends.some(f => f.user.equals(targetUser._id));
    if (alreadyFriends) throw new ApiError(400, "Already friends");

    const alreadySent = currentUser.friendRequests.sent.some(f => f.user.equals(targetUser._id));
    if (alreadySent) throw new ApiError(400, "Friend request already sent");

    const theyAlreadySent = currentUser.friendRequests.received.some(f => f.user.equals(targetUser._id));
    if (theyAlreadySent) {

        currentUser.friends.push({ user: targetUser._id });
        targetUser.friends.push({ user: currentUser._id });


        currentUser.friendRequests.received = currentUser.friendRequests.received.filter(
            f => !f.user.equals(targetUser._id)
        )
        targetUser.friendRequests.sent = targetUser.friendRequests.sent.filter(
            f => !f.user.equals(currentUser._id)
        )

        await currentUser.save({ validateBeforeSave: false });
        await targetUser.save({ validateBeforeSave: false });

        return res.status(200).json(new ApiResponse(200, {}, "You are now friends!"));
    }

    const blockedByTarget = targetUser.blockedUsers.some(id => id.equals(currentUser._id));
    if (blockedByTarget) throw new ApiError(403, "Cannot send request to this user");

    const youBlocked = currentUser.blockedUsers.some(id => id.equals(targetUser._id));
    if (youBlocked) throw new ApiError(403, "Unblock this user first");


    currentUser.friendRequests.sent.push({ user: targetUser._id });
    targetUser.friendRequests.received.push({ user: currentUser._id });

    await currentUser.save({ validateBeforeSave: false });
    await targetUser.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Friend request sent"));

});

const getAllFriends = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select("friends")
        .populate("friends.user", "name userId profilePic bio status lastSeen")

    if (!user) throw new ApiError(404, "User not found")

    return res.status(200).json(
        new ApiResponse(200, user.friends, "All friends")
    )
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const sender = await User.findOne({ userId })
    if (!sender) throw new ApiError(404, "User not found")

    const currentUser = await User.findById(req.user._id)

    const requestExists = currentUser.friendRequests.received.some(
        f => f.user.equals(sender._id)
    )
    if (!requestExists) throw new ApiError(400, "No friend request from this user")

    const alreadyFriends = currentUser.friends.some(
        f => f.user.equals(sender._id)
    )
    if (alreadyFriends) throw new ApiError(400, "Already friends")

    // Add each other as friends
    currentUser.friends.push({ user: sender._id })
    sender.friends.push({ user: currentUser._id })

    // Clear requests
    currentUser.friendRequests.received = currentUser.friendRequests.received.filter(
        f => !f.user.equals(sender._id)
    )
    sender.friendRequests.sent = sender.friendRequests.sent.filter(
        f => !f.user.equals(currentUser._id)
    )

    await currentUser.save({ validateBeforeSave: false })
    await sender.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, {}, `You are now friends with ${sender.name}`)
    )
});

const rejectFriendRequest = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const sender = await User.findOne({ userId })
    if (!sender) throw new ApiError(404, "User not found")

    const currentUser = await User.findById(req.user._id)

    const requestExists = currentUser.friendRequests.received.some(
        f => f.user.equals(sender._id)
    )
    if (!requestExists) throw new ApiError(400, "No friend request from this user")

    // Remove from both sides
    currentUser.friendRequests.received = currentUser.friendRequests.received.filter(
        f => !f.user.equals(sender._id)
    )
    sender.friendRequests.sent = sender.friendRequests.sent.filter(
        f => !f.user.equals(currentUser._id)
    )

    await currentUser.save({ validateBeforeSave: false })
    await sender.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, {}, "Friend request rejected")
    )
});

const unfriend = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const targetUser = await User.findOne({ userId })
    if (!targetUser) throw new ApiError(404, "User not found")

    const currentUser = await User.findById(req.user._id)

    const areFriends = currentUser.friends.some(
        f => f.user.equals(targetUser._id)
    )
    if (!areFriends) throw new ApiError(400, "You are not friends with this user")

    // Remove each other from friends
    currentUser.friends = currentUser.friends.filter(
        f => !f.user.equals(targetUser._id)
    )
    targetUser.friends = targetUser.friends.filter(
        f => !f.user.equals(currentUser._id)
    )

    await currentUser.save({ validateBeforeSave: false })
    await targetUser.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, {}, "Unfriended successfully")
    )
});

const blockUnblockUser = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const targetUser = await User.findOne({ userId })
    if (!targetUser) throw new ApiError(404, "User not found")

    if (targetUser._id.equals(req.user._id)) {
        throw new ApiError(400, "You can't block yourself")
    }

    const currentUser = await User.findById(req.user._id)

    const isBlocked = currentUser.blockedUsers.some(
        id => id.equals(targetUser._id)
    )

    if (isBlocked) {
        // ── Unblock ──
        currentUser.blockedUsers = currentUser.blockedUsers.filter(
            id => !id.equals(targetUser._id)
        )
        await currentUser.save({ validateBeforeSave: false })

        return res.status(200).json(
            new ApiResponse(200, {}, `${targetUser.name} unblocked`)
        )

    } else {

        currentUser.blockedUsers.push(targetUser._id)

        currentUser.friends = currentUser.friends.filter(
            f => !f.user.equals(targetUser._id)
        )
        targetUser.friends = targetUser.friends.filter(
            f => !f.user.equals(currentUser._id)
        )

        currentUser.friendRequests.sent = currentUser.friendRequests.sent.filter(
            f => !f.user.equals(targetUser._id)
        )
        currentUser.friendRequests.received = currentUser.friendRequests.received.filter(
            f => !f.user.equals(targetUser._id)
        )
        targetUser.friendRequests.sent = targetUser.friendRequests.sent.filter(
            f => !f.user.equals(currentUser._id)
        )
        targetUser.friendRequests.received = targetUser.friendRequests.received.filter(
            f => !f.user.equals(currentUser._id)
        )

        await currentUser.save({ validateBeforeSave: false })
        await targetUser.save({ validateBeforeSave: false })

        return res.status(200).json(
            new ApiResponse(200, {}, `${targetUser.name} blocked`)
        )
    }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getMe,
     updateProfile, searchUser, checkFriendRequestsRecieved, sendFriendRequest,
     checkFriendRequestsSent,getAllFriends,blockUnblockUser,unfriend,rejectFriendRequest,acceptFriendRequest };