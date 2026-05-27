// routes/notification.routes.js
import { Router } from "express"
import { VerifyJWT } from "../middlewares/auth.middleware.js"
import * as notificationController from "../controllers/notification.controller.js"

const router = Router()

router.route("/").get(VerifyJWT, notificationController.getNotifications)
router.route("/unread-count").get(VerifyJWT, notificationController.getUnreadCount)
router.route("/mark-all-read").patch(VerifyJWT, notificationController.markAllAsRead)
router.route("/delete-all").delete(VerifyJWT, notificationController.deleteAllNotifications)
router.route("/:id/mark-read").patch(VerifyJWT, notificationController.markAsRead)
router.route("/:id").delete(VerifyJWT, notificationController.deleteNotification)

export default router