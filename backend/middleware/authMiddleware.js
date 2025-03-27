import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  console.log("Headers:", req.headers);
  console.log("Cookies:", req.cookies);
  
  let token;
  
  // Check Authorization header first
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log("Token from Authorization header:", token);
  } 
  // Fallback to cookie
  else {
    token = req.cookies.jwt;
    console.log("Token from cookie:", token);
  }
  
  console.log("TOKEEENNNN", token);

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      console.log("Token verification error:", error.message);
      res.status(401);
      throw new Error("Not authorized, invalid token");
    }
  } else {
    console.log("No token found in request");
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

const teacher = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'teacher') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as teacher');
  }
});

export { protect, teacher };