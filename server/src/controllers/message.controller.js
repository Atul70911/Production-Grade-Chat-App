import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { Message } from "../models/message.models.js";
import { Conversation } from "../models/conversation.models.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const sendMessage = asyncHandler(async (req, res) => {
    const { conversationId, content, type } = req.body;

    if (!conversationId) throw new ApiError(400, "conversationId is required");
    if (!content && (!req.files || !req.files.attachments || req.files.attachments.length === 0)) throw new ApiError(400, "Message Content is required");

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new ApiError(400, "Conversation not found");

    const isMember = conversation.members.some(f => f.user.equals(req.user._id));
    if (!isMember) throw new ApiError(403, "You are not a member of this conversation");

    let attachments = [];
    if (req.files && req.files.attachments && req.files.attachments.length > 0) {
        for (const file of req.files.attachments) {
            const uploaded = await uploadOnCloudinary(file.path)
            if (!uploaded) throw new ApiError(500, "File upload failed")

            attachments.push({
                url: uploaded.secure_url,
                publicId: uploaded.public_id,
                type: file.mimetype.split("/")[0],
                name: file.originalname,
                size: file.size
            })
        }
    };
    const message = await Message.create({
        conversation: conversationId,
        sender: req.user._id,
        content: content || "",
        type: type || "text",
        attachments
    })
    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id
    })

    const populated = await Message.findById(message._id)
        .populate("sender", "name userId profilePic")

    return res.status(201).json(
        new ApiResponse(201, populated, "Message sent")
    )

});

const getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20

    // Check conversation exists
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) throw new ApiError(404, "Conversation not found")

    // Check if current user is a member
    const isMember = conversation.members.some(
        m => m.user.equals(req.user._id)
    )
    if (!isMember) throw new ApiError(403, "You are not a member of this conversation")

    // Total messages count
    const totalMessages = await Message.countDocuments({
        conversation: conversationId,
        isDeleted: false
    })

    // Fetch paginated messages
    const messages = await Message.find({
        conversation: conversationId,
        isDeleted: false
    })
    .populate("sender", "name userId profilePic")
    .sort({ createdAt: -1 })        // latest first
    .skip((page - 1) * limit)
    .limit(limit)

    return res.status(200).json(
        new ApiResponse(200, {
            messages,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalMessages / limit),
                totalMessages,
                hasNextPage: page < Math.ceil(totalMessages / limit),
                hasPrevPage: page > 1
            }
        }, "Messages fetched")
    )
})

// ── Delete Message (Soft Delete) ──────────────────────────────
const deleteMessage = asyncHandler(async (req, res) => {
    const { id } = req.params

    const message = await Message.findById(id)
    if (!message) throw new ApiError(404, "Message not found")

    // Only sender can delete
    if (!message.sender.equals(req.user._id)) {
        throw new ApiError(403, "You can only delete your own messages")
    }

    // Already deleted
    if (message.isDeleted) throw new ApiError(400, "Message already deleted")

    // Soft delete
    message.isDeleted = true
    message.deletedAt = new Date()
    message.content = "This message was deleted"
    await message.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, {}, "Message deleted")
    )
})


// ── Edit Message ───────────────────────────────────────────────
const editMessage = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { content } = req.body

    if (!content) throw new ApiError(400, "Content is required")

    const message = await Message.findById(id)
    if (!message) throw new ApiError(404, "Message not found")

    // Only sender can edit
    if (!message.sender.equals(req.user._id)) {
        throw new ApiError(403, "You can only edit your own messages")
    }

    // Can't edit deleted message
    if (message.isDeleted) throw new ApiError(400, "Cannot edit a deleted message")

    // Can't edit non-text messages
    if (message.type !== "text") {
        throw new ApiError(400, "Only text messages can be edited")
    }

    message.content = content
    message.isEdited = true
    message.editedAt = new Date()
    await message.save({ validateBeforeSave: false })

    const populated = await Message.findById(message._id)
        .populate("sender", "name userId profilePic")

    return res.status(200).json(
        new ApiResponse(200, populated, "Message edited")
    )
})
export { sendMessage ,getMessages,deleteMessage,editMessage};