import express from "express";
import {
  UserRegister,
  Signin,
  Signout,
  tokenRefresh,
  getAllUsers,
  getOneUser,
  updateCount,
  updateCount2,
  updateUser,
} from "../Controllers/User-Account-Controller.js";
import multer from "multer";
import path from "path";
const router = express.Router();
const rateLimit = require("express-rate-limit");
const expressRateLimit = require("express-rate-limit");

// General Rate Limit (can be adjusted per endpoint)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later",
});

// Apply rate limit to all routes
router.use(limiter);

// Specific Rate Limit for Sign-up
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many accounts created from this IP, please try again later",
});

// File Upload Limits
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "UploadUserProfileImages");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Set limits for file uploads (e.g., max file size: 2MB)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB file size limit
  },
});

// Rate Limit for specific sensitive routes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit login attempts
  message: "Too many login attempts from this IP, please try again later",
});

// Apply JSON body size limits globally
router.use(express.json({ limit: "1kb" })); // Limit request body to 1 KB
router.use(express.urlencoded({ extended: true, limit: "1kb" }));

// Routes
router.post(
  "/usersignup",
  registerLimiter,
  upload.single("ProfilePicture"),
  UserRegister
);

router.post("/usersignin", loginLimiter, Signin); // Rate limit for login
router.delete("/usersignout", Signout);
router.post("/Token", loginLimiter, tokenRefresh); // Rate limit for token refresh
router.get("/allusers", getAllUsers);
router.get("/user/:userid", getOneUser);
router.put("/count/:id", limiter, updateCount);
router.put("/countReduce/:id", limiter, updateCount2);
router.put("/updateUser/:id", limiter, updateUser);

export default router;
