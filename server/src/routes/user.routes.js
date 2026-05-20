import { Router } from "express";
import * as authController from "../controllers/auth.controller.js"
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();

router.route("/register").post(upload.fields([{ name: "profilePic", maxCount: 1 }]), authController.registerUser);

export default router;