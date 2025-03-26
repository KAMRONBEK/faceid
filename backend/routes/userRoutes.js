import express from "express";
import {
  authUser,
  getUserProfile,
  logoutUser,
  registerUser,
  updateUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { createExam, getExams } from "../controllers/examController.js";
const userRoutes = express.Router();
userRoutes.post("/", registerUser); // Faqat shuni qoldiring
userRoutes.post("/auth", authUser);
userRoutes.post("/logout", logoutUser);
// protecting profile route using auth middleware protect
userRoutes
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default userRoutes;
