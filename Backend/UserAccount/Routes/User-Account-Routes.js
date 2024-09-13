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
  limiter,
} from "../Controllers/User-Account-Controller.js";
import multer from "multer";
import path from "path";
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "UploadUserProfileImages");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/usersignup",
  limiter,
  upload.single("ProfilePicture"),
  UserRegister
);
router.post("/usersignin", Signin);
router.delete("/usersignout", Signout);
router.post("/Token", tokenRefresh);
router.get("/allusers", getAllUsers);
router.get("/user/:userid", getOneUser);
router.put("/count/:id", updateCount);
router.put("/countReduce/:id", updateCount2);
router.put("/updateUser/:id", updateUser);

export default router;
