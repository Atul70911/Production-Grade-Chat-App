import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true
        },
        type: {
            type: String,
            enum: ['text', 'image', 'video', 'audio', 'file', 'system'],
            default: 'text'
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            trim: true
        },
        attachments: [{
            url: String,
            publicId: String,
            type: String,
            name: String,
            size: Number
        }],
        isEdited: {
            type: Boolean,
            default: false
        },
        editedAt: Date,

        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date,
        reaction: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }, emoji: String
        }],
        readBy: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            readAt: {
                type: Date,
                default: Date.now
            }
        }],
    }, { timestamps: true })

messageSchema.index({ conversation: 1, createdAt: -1 })
messageSchema.index({ sender: 1 })

export const Message = mongoose.model('Message', messageSchema)