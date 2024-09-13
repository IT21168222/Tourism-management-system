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

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many accounts created from this IP, please try again later",
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "UploadUserProfileImages");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  limits: { fileSize: 1 * 1024 * 1024 }, // Limit file size to 1 MB
  fileFilter: (req, file, cb) => {
    // Only accept certain image types (e.g., png, jpeg)
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Invalid file type"), false);
    }
    cb(null, true);
  },
}).single("ProfilePicture");

// const upload = multer({ storage: storage });

// router.post(
//   "/usersignup",
//   registerLimiter,
//   upload.single("ProfilePicture"),
//   UserRegister
// );

const limiter = require("../Controllers/limiter");

router.post("/usersignup", limiter, UserRegister);
router.post("/usersignin", Signin);
router.delete("/usersignout", Signout);
router.post("/Token", tokenRefresh);
router.get("/allusers", getAllUsers);
router.get("/user/:userid", getOneUser);
router.put("/count/:id", updateCount);
router.put("/countReduce/:id", updateCount2);
router.put("/updateUser/:id", updateUser);

export default router;
