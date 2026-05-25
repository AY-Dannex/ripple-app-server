import { Router } from "express";
import protect from "../middleware/auth.middleware.js"
import upload from "../middleware/upload.middleware.js";
import { requestOTP, verifyOTP } from "../middleware/otp.middleware.js";
import { registerUser, loginUsers, logoutUsers, getProfile, updateProfile, getOtherUserProfile, assignRole, suspendUser, deleteUser, uploadProfilePic, deleteProfilePic, getUser, getAllUsers } from "../controllers/user.controller.js";

const router = Router()

router.route('/register').post(verifyOTP, registerUser)
router.route('/request-otp').post(requestOTP)
router.route('/login').post(loginUsers)
router.route('/profile').get(protect, getProfile)
router.route('/update-profile').patch(protect, updateProfile)
router.route('/get-other-user-profile').get(protect, getOtherUserProfile)
router.route('/upload-profile-pic').patch(protect, upload.single("profilePic"), uploadProfilePic)
router.route('/delete-profile-pic').delete(protect, deleteProfilePic)
router.route('/logout').post(logoutUsers)
router.route('/assign-role').patch(protect, assignRole)
router.route('/suspend').patch(protect, suspendUser)
router.route('/delete').delete(protect, deleteUser)
router.route('/get-user').get(protect, getUser)
router.route('/get-all-users').get(protect, getAllUsers) 

export default router