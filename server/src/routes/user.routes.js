import { Router } from "express";
import * as authController from "../controllers/auth.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(upload.fields([{ name: "profilePic", maxCount: 1 }]), authController.registerUser);
router.route("/login").post(authController.loginUser);
router.route("/change-password").post(VerifyJWT,authController.changeCurrentPassword);
router.route("/refresh-token").post(authController.refreshAccessToken);
router.route("/logout").post(VerifyJWT,authController.logoutUser);

export default router;