import { Server, Socket } from "socket.io"
import { Message } from "../models/message.models.js"
import { Conversation } from "../models/conversation.models.js"
import { Notification } from "../models/notification.models.js"
import redisClient from "../utils/redis.js"

const onlineUsers = new Map();

const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true,
        }
    })

    io.on("connection", (socket) => {
        console.log("User Connected", socket.id);

        socket.on("userOnline", async (userId) => {
            onlineUsers.set(userId, socket.id);
            socket.userId = userId;
            await redisClient.sAdd("onlineUsers", userId)
            io.emit("onlineUsers:", Array.from(onlineUsers.keys()))
            console.log(`${userId} is online`)
        });
        socket.on("joinConversation", (conversationId) => {
            socket.join(conversationId);
            console.log(`${socket.userId} joined room: ${conversationId}`)
        });
        socket.on("leaveConversation", (conversationId) => {
            socket.leave(conversationId);
            console.log(`${socket.userId} left room: ${conversationId}`)
        });
        socket.on("sendMessage", async (data) => {
            const { conversationId, content, type } = data
            try {
                const message = await Message.create({
                    conversation: conversationId,
                    sender: socket.userId,
                    content,
                    type: type || "text"
                })

                await Conversation.findByIdAndUpdate(conversationId, {
                    lastMessage: message._id
                })

                const populated = await Message.findById(message._id)
                    .populate("sender", "name userId profilePic")

                io.to(conversationId).emit("newMessage", populated)

            } catch (error) {
                socket.emit("error", "Message failed to send")
            }
        });
        socket.on("typing", ({ conversationId, userId }) => {
            socket.to(conversationId).emit("userTyping", { userId })
        });
        socket.on("stopTyping", ({ conversationId, userId }) => {
            socket.to(conversationId).emit("userStopTyping", { userId })
        });
        socket.on("messageRead", async ({ messageId, conversationId, userId }) => {
            try {
                await Message.findByIdAndUpdate(messageId, {
                    $push: {
                        readBy: { user: userId, readAt: new Date() }
                    }
                })
                socket.to(conversationId).emit("messageRead", { messageId, userId })
            } catch (error) {
                console.error("Read receipt error:", error)
            }
        });
        socket.on("addReaction", async ({ messageId, conversationId, emoji }) => {
            try {
                const message = await Message.findById(messageId)
                if (!message) return socket.emit("error", "Message not found")

                const existingReaction = message.reaction.find(
                    r => r.user.equals(socket.userId) && r.emoji === emoji
                )

                if (existingReaction) {
                    message.reaction = message.reaction.filter(
                        r => !(r.user.equals(socket.userId) && r.emoji === emoji)
                    )
                } else {
                    message.reaction.push({
                        user: socket.userId,
                        emoji
                    })
                }

                await message.save({ validateBeforeSave: false })

                const populated = await Message.findById(messageId)
                    .populate("reaction.user", "name userId profilePic")

                io.to(conversationId).emit("reactionUpdated", {
                    messageId,
                    reactions: populated.reaction
                })

            } catch (error) {
                socket.emit("error", "Reaction failed")
            }
        });

        socket.on("sendNotification", async ({ recipientId, type, message }) => {
            try {
                const notification = await Notification.create({
                    recipient: recipientId,
                    sender: socket.userId,
                    type,
                    message
                })

                const recipientSocketId = onlineUsers.get(recipientId)

                if (recipientSocketId) {
                    io.to(recipientSocketId).emit("newNotification", notification)
                }

            } catch (error) {
                socket.emit("error", "Notification failed")
            }
        })

        socket.on("markNotificationRead", async ({ notificationId }) => {
            try {
                await Notification.findByIdAndUpdate(notificationId, {
                    isRead: true
                })
                socket.emit("notificationRead", { notificationId })
            } catch (error) {
                socket.emit("error", "Failed to mark notification")
            }
        });
        socket.on("disconnect",async () => {
            onlineUsers.delete(socket.userId)
            await redisClient.sRem("onlineUsers", socket.userId)
            io.emit("onlineUsers", Array.from(onlineUsers.keys()))
            console.log("User disconnected:", socket.id)
        });

    })

    return io;
}

export { initSocket };