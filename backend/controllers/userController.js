import asyncHandler from "express-async-handler";
import User from "./../models/userModel.js";
import generateToken from "../utils/generateToken.js";

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(res, user._id); // Tokenni olish

    // Create response object
    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token, // Responsega tokenni qo'shish
      message: "User Successfully login with role: " + user.role,
    };

    // Include face embedding if it exists
    if (user.faceEmbedding) {
      response.faceEmbedding = user.faceEmbedding;
    }

    res.status(200).json(response);
  } else {
    res.status(401);
    throw new Error("Invalid User email or password");
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, faceEmbedding } = req.body;

  const userExist = await User.findOne({ email });

  if (userExist) {
    res.status(400);
    throw new Error("User Already Exists");
  }

  // Validate face embedding for students
  if (role === 'student' && !faceEmbedding) {
    res.status(400);
    throw new Error("Face embedding is required for student registration");
  }

  // Create user with the provided data
  const userData = {
    name,
    email,
    password,
    role
  };

  // Add face embedding for students
  if (role === 'student') {
    userData.faceEmbedding = faceEmbedding;
  }

  const user = await User.create(userData);

  if (user) {
    const token = generateToken(res, user._id); // Tokenni olish

    // Create response object
    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token, // Responsega tokenni qo'shish
      message: "User Successfully created with role: " + user.role,
    };

    // Include face embedding if it exists
    if (user.faceEmbedding) {
      response.faceEmbedding = user.faceEmbedding;
    }

    res.status(201).json(response);
  } else {
    res.status(400);
    throw new Error("Invalid User Data");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: " User logout User" });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Create response object with user data
  const response = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  // Include face embedding if it exists
  if (user.faceEmbedding) {
    response.faceEmbedding = user.faceEmbedding;
  }

  res.status(200).json(response);
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;

    // Update face embedding if provided
    if (req.body.faceEmbedding) {
      user.faceEmbedding = req.body.faceEmbedding;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    // Create response object with updated user data
    const response = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    };

    // Include face embedding if it exists
    if (updatedUser.faceEmbedding) {
      response.faceEmbedding = updatedUser.faceEmbedding;
    }

    res.status(200).json(response);
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});

// Get user's face embedding
const getUserFaceEmbedding = asyncHandler(async (req, res) => {
  // If userId is provided, use it; otherwise use the authenticated user's ID
  const userId = req.params.userId || req.user._id;

  const user = await User.findById(userId).select('faceEmbedding');

  if (user && user.faceEmbedding) {
    res.json({
      faceEmbedding: user.faceEmbedding
    });
  } else {
    res.status(404);
    throw new Error("Face embedding not found");
  }
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUserFaceEmbedding
};
