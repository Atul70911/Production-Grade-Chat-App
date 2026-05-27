import { Router } from "express";
import * as conversationController from "../controllers/conversation.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";

const router= Router();

router.route("/create-direct-conversation").post(VerifyJWT,conversationController.createDirectConversations);
router.route("/create-group-conversation").post(VerifyJWT,conversationController.createGroupConversation);
router.route("/get-conversation-by-userId/:userId").get(VerifyJWT,conversationController.getConversationByUserId);
router.route("/get-my-conversations").get(VerifyJWT,conversationController.getMyConversations);
router.route("/get-conversation-by-id/:id").get(VerifyJWT,conversationController.getSingleConversation);
router.route("/add-remove-member/:id").patch(VerifyJWT, conversationController.addRemoveMember)


export default router;
