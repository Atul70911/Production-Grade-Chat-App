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

router.route("/get-me").get(VerifyJWT,authController.getMe)
router.route("/update-profile").patch(VerifyJWT, authController.updateProfile)

router.route("/search-user").get(VerifyJWT,authController.searchUser);
router.route("/friends").get(VerifyJWT, authController.getAllFriends);
router.route("/friend-requests-received").get(VerifyJWT,authController.checkFriendRequestsRecieved);
router.route("/friend-requests-sent").get(VerifyJWT,authController.checkFriendRequestsSent);
router.route("/send-friend-request").post(VerifyJWT,authController.sendFriendRequest);
router.route("/friend-request/:userId/accept").patch(VerifyJWT, authController.acceptFriendRequest)
router.route("/friend-request/:userId/reject").patch(VerifyJWT, authController.rejectFriendRequest)
router.route("/friends/:userId").delete(VerifyJWT, authController.unfriend)
router.route("/block/:userId").post(VerifyJWT, authController.blockUnblockUser)

export default router;