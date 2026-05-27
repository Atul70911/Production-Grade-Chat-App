import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";
import { Conversation } from "../models/conversation.models.js"
import { Message } from "../models/message.models.js"

const createDirectConversations = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) throw new ApiError(404, "userId is required");
    const targetUser = await User.findOne({ userId });
    if (!targetUser) throw new ApiError(404, "User not found");

    const currentUser = await User.findById(req.user._id);
    if (!currentUser) throw new ApiError(500, "Internal Server Error");

    if (targetUser._id.equals(currentUser._id)) {
        throw new ApiError(400, "You can't create a conversation with yourself")
    }

    const areFriends = currentUser.friends.some(f => f.user.equals(targetUser._id));
    if (!areFriends) throw new ApiError(400, "You can only message friends");

    const existingConversation = await Conversation.findOne({
        type: "direct",
        members: {
            $all: [
                { $elemMatch: { user: currentUser._id } },
                { $elemMatch: { user: targetUser._id } }
            ]
        }
    }).populate("members.user", "name userId profilePic status lastSeen")
        .populate("lastMessage");

    if (existingConversation) {
        return res.status(200).json(new ApiResponse(200, existingConversation, "Conversation already exists"))
    }

    const conversation = await Conversation.create({
        type: "direct",
        members: [
            { user: currentUser._id },
            { user: targetUser._id }
        ]
    });

    const populated = await Conversation.findById(conversation._id)
        .populate("members.user", "name userId profilePic status lastSeen")

    return res.status(201).json(
        new ApiResponse(201, populated, "Conversation created")
    )

});

const createGroupConversation= asyncHandler(async(req,res)=>{
    const {name,members}=req.body;
    if(!name)throw new ApiError(400,"Group name is required");
    if(!members || members.length<1){
        throw new ApiError(400,"Not enough members to create group");
    }
    const memberUsers= await User.find({userId:{$in:members}});
    if(memberUsers.length !== members.length){
         throw new ApiError(404, "One or more users not found");
    }  

    const memberList=[
        {user:req.user._id,role:"admin"},
        ...memberUsers.map(u=>({user:u._id,role:"member"}))
    ];

    const conversation=await Conversation.create({
        type:"group",
        name,
        members:memberList,
        admin:[req.user._id]
    });

    const populated= await Conversation.findById(conversation._id).populate("members.user","name userId profilePic status")
    .populate("admin","name userId profilePic status");

    return res.status(201).json(new ApiResponse(201, populated, "Group created"))
});

const getMyConversations= asyncHandler(async(req,res)=>{
    const conversations=await Conversation.find({
        members:{$elemMatch:{user:req.user._id}},
        isActive:true
    }).populate("members.user","name userId profilePic status lastSeen")
    .populate("lastMessage")
    .sort({updatedAt:-1});

    if(!conversations) throw new ApiError(404, "No conversations found")

    return res.status(200).json(new ApiResponse(200,conversations,"All conversations"));

});

const getSingleConversation = asyncHandler(async (req, res) => {
    const { id } = req.params

    const conversation = await Conversation.findById(id)
        .populate("members.user", "name userId profilePic status lastSeen")
        .populate("lastMessage")
        .populate("admin", "name userId profilePic")

    if (!conversation) throw new ApiError(404, "Conversation not found")

    const isMember = conversation.members.some(
        m => m.user._id.equals(req.user._id)
    )
    if (!isMember) throw new ApiError(403, "You are not a member of this conversation")

    return res.status(200).json(
        new ApiResponse(200, conversation, "Conversation fetched")
    )
});

const getConversationByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params

    
    const targetUser = await User.findOne({ userId })
    if (!targetUser) throw new ApiError(404, "User not found")

    
    const conversation = await Conversation.find({
       
        members: {
            $all: [
                { $elemMatch: { user: req.user._id } },
                { $elemMatch: { user: targetUser._id } }
            ]
        }
    })
    .populate("members.user", "name userId profilePic status lastSeen")
    .populate("type lastMessage")

    if (!conversation) throw new ApiError(404, "No conversation found with this user")

    return res.status(200).json(
        new ApiResponse(200, conversation, "Conversation fetched")
    )
});

const addRemoveMember = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { userId, action } = req.body


    if (!userId) throw new ApiError(400, "userId is required")
    if (!action || !["add", "remove"].includes(action)) {
        throw new ApiError(400, "action must be 'add' or 'remove'")
    }

    const conversation = await Conversation.findById(id)
    if (!conversation) throw new ApiError(404, "Conversation not found")

    if (conversation.type === "direct") {
        throw new ApiError(400, "Cannot add/remove members in direct conversation")
    }

    const isAdmin = conversation.admin.some(a => a.equals(req.user._id))
    if (!isAdmin) throw new ApiError(403, "Only admin can add or remove members")

    const targetUser = await User.findOne({ userId })
    if (!targetUser) throw new ApiError(404, "User not found")

    if (targetUser._id.equals(req.user._id)) {
        throw new ApiError(400, "You can't add or remove yourself")
    }

    const isMember = conversation.members.some(
        m => m.user.equals(targetUser._id)
    )

    if (action === "add") {
        if (isMember) throw new ApiError(400, "User is already a member")

        conversation.members.push({
            user: targetUser._id,
            role: "member"
        })

        await conversation.save({ validateBeforeSave: false })

        const populated = await Conversation.findById(id)
            .populate("members.user", "name userId profilePic status")
            .populate("admin", "name userId profilePic")

        return res.status(200).json(
            new ApiResponse(200, populated, `${targetUser.name} added to group`)
        )
    }

    if (action === "remove") {
        if (!isMember) throw new ApiError(400, "User is not a member")

        const isTargetAdmin = conversation.admin.some(
            a => a.equals(targetUser._id)
        )
        if (isTargetAdmin) throw new ApiError(403, "Cannot remove an admin")

        conversation.members = conversation.members.filter(
            m => !m.user.equals(targetUser._id)
        )

        await conversation.save({ validateBeforeSave: false })

        const populated = await Conversation.findById(id)
            .populate("members.user", "name userId profilePic status")
            .populate("admin", "name userId profilePic")

        return res.status(200).json(
            new ApiResponse(200, populated, `${targetUser.name} removed from group`)
        )
    }
})

export {createDirectConversations,createGroupConversation,getMyConversations,getSingleConversation,getConversationByUserId,addRemoveMember};