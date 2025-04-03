import express from "express";
import {
  authUser,
  getUserProfile,
  logoutUser,
  registerUser,
  updateUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { saveCheatingLog, getCheatingLogsByExamId } from "../controllers/cheatingLogController.js";
const userRoutes = express.Router();

userRoutes.post("/", registerUser);
userRoutes.post("/auth", authUser);
userRoutes.post("/logout", logoutUser);

// protecting profile route using auth middleware protect
userRoutes
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

userRoutes.route('/cheatingLogs')
  .post(protect, saveCheatingLog)
  .get(protect, getCheatingLogsByExamId);

export default userRoutes;
