import { Router } from "express";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import * as messageController from "../controllers/message.controller.js"
import { upload } from "../middlewares/multer.middleware.js";

const router=Router();

router.route("/send-message").post(VerifyJWT,upload.fields([{ name: "attachments", maxCount: 10 }]),messageController.sendMessage);
router.route("/get-messages/:conversationId").get(VerifyJWT,messageController.getMessages);
router.route("/delete/:id").delete(VerifyJWT, messageController.deleteMessage)
router.route("/edit/:id").patch(VerifyJWT, messageController.editMessage)


export default router;