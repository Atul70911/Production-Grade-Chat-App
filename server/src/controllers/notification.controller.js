// controllers/notification.controller.js

import { Notification } from "../models/notification.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// ── Get all notifications ──────────────────────────────────────
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({
        recipient: req.user._id
    })
    .populate("sender", "name userId profilePic")
    .sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(200, notifications, "Notifications fetched")
    )
})

// ── Get unread count ───────────────────────────────────────────
const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({
        recipient: req.user._id,
        isRead: false
    })

    return res.status(200).json(
        new ApiResponse(200, { count }, "Unread count fetched")
    )
})

// ── Mark single notification as read ──────────────────────────
const markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params

    const notification = await Notification.findById(id)
    if (!notification) throw new ApiError(404, "Notification not found")

    if (!notification.recipient.equals(req.user._id)) {
        throw new ApiError(403, "Unauthorized")
    }

    notification.isRead = true
    await notification.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, {}, "Marked as read")
    )
})

// ── Mark all notifications as read ────────────────────────────
const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { isRead: true }
    )

    return res.status(200).json(
        new ApiResponse(200, {}, "All notifications marked as read")
    )
})

// ── Delete single notification ─────────────────────────────────
const deleteNotification = asyncHandler(async (req, res) => {
    const { id } = req.params

    const notification = await Notification.findById(id)
    if (!notification) throw new ApiError(404, "Notification not found")

    if (!notification.recipient.equals(req.user._id)) {
        throw new ApiError(403, "Unauthorized")
    }

    await Notification.findByIdAndDelete(id)

    return res.status(200).json(
        new ApiResponse(200, {}, "Notification deleted")
    )
})

// ── Delete all notifications ───────────────────────────────────
const deleteAllNotifications = asyncHandler(async (req, res) => {
    await Notification.deleteMany({ recipient: req.user._id })

    return res.status(200).json(
        new ApiResponse(200, {}, "All notifications deleted")
    )
})

export {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
}