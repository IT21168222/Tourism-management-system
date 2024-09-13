import User from "../Models/User-Account-Model.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import rateLimit from "express-rate-limit";

let refreshtokens = [];

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later",
  headers: true,
});

export const UserRegister = async (req, res) => {
  try {
    let file = "N/A"; // Default if no file is uploaded
    let profilePictureData = Buffer.alloc(0); // Default empty buffer for profile picture

    if (req.file) {
      const sanitizedFilename = path.basename(req.file.filename);
      file = sanitizedFilename;
      const filePath = path.join("UploadUserProfileImages", file);
      // Safely read the file if it exists
      if (fs.existsSync(filePath)) {
        profilePictureData = fs.readFileSync(filePath);
      }
    }

    const ExsistUser = await User.findOne({ email: req.body.email });
    if (ExsistUser) {
      return res.status(404).json({ message: "User Already registered..!" });
    }
    const USER_ID = "UID" + Date.now();
    const no = 0;

    const newUser = new User({
      user_id: USER_ID,
      userName: req.body.userName,
      birthday: req.body.birthday,
      email: req.body.email,
      password: req.body.password,
      country: req.body.country,
      gender: req.body.gender,
      badge: req.body.badge,
      tel_no: req.body.tel_no,
      post_count: no,
      ProfilePicture: {
        data: profilePictureData, // Either the uploaded file data or an empty buffer
        contentType: req.file ? "image/png" : null, // Only set contentType if a file is uploaded
      },
    });

    const newAcct = await newUser.save();
    if (newAcct) {
      res.status(201).json({
        message: "Registration Successful..!",
        payload: newAcct,
      });
    } else {
      res.status(400).json({
        message: "Something Went Wrong In Account Creating..!",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something Went Wrong..!",
      error: error,
    });
    console.log(error);
  }
};

export const Signin = async (req, res) => {
  try {
    const RegisteredUser = await User.findOne({ email: req.body.email });
    if (RegisteredUser) {
      const enteredPwd = req.body.password;
      const dbPwd = RegisteredUser.password;
      const uid = RegisteredUser._id;
      if (enteredPwd === dbPwd) {
        const token = jwt.sign(
          { email: req.body.email },
          process.env.JWT_TOKEN_KEY1,
          { expiresIn: "1h" }
        );
        const refreshToken = jwt.sign(
          { email: req.body.email },
          process.env.REFRESH_TOKEN_KEY1,
          { expiresIn: "24h" }
        );
        refreshtokens.push(refreshToken);
        res.status(201).json({
          message: "Login Successful..!",
          token,
          refreshToken,
          payload: { uid },
        });
      } else {
        res.status(401).json({
          message: "Incorrect Password..!",
        });
      }
    } else {
      res.status(404).json({
        message: "User Not Registered..!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error..!",
      error: error,
    });
  }
};

export const tokenRefresh = (req, res, next) => {
  const refreshToken = req.body.refreshToken;
  if (refreshToken == null) {
    res.status(401).json({
      message: "Unauthorized..!",
    });
  } else if (!refreshtokens.includes(refreshToken)) {
    res.status(403).json({
      message: "Forbidden..!",
    });
  } else {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY1, (err, user) => {
      if (err) {
        res.status(403).json({
          message: "Forbidden..!",
        });
      } else {
        const token = jwt.sign(
          { email: req.body.email },
          process.env.JWT_TOKEN_KEY1,
          { expiresIn: "1h" }
        );
        res.status(201).json({
          message: "Session Extended..!",
          token,
        });
      }
    });
  }
};

export const Signout = (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    refreshtokens = refreshtokens.filter((token) => token !== refreshToken);
    res.status(200).json({
      message: "Signout successful!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong!",
      error: error,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const allusers = await User.find();
    if (allusers) {
      res.status(200).json({
        message: "Fetched Successfully..!",
        payload: allusers,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const getOneUser = async (req, res) => {
  try {
    let userId = req.params.userid;
    const user = await User.findById(userId);
    if (user) {
      res.status(200).json({ user });
    }
  } catch (error) {
    console.log(error);
  }
};

export const updateUser = async (req, res) => {
  const id = req.params.id;

  const updatePost = {
    user_id: req.body.user_id,
    userName: req.body.newuserName,
    birthday: req.body.newbirthday,
    email: req.body.newcountry,
    password: req.body.newpassword,
    country: req.body.newcountry,
    gender: req.body.newgender,
    tel_no: req.body.newtel_no,
    badge: req.body.badge,
    post_count: req.body.post_count,
  };

  try {
    const updatedPost = await User.findByIdAndUpdate(id, updatePost, {
      new: true,
    });
    if (updatedPost) {
      res.status(200).send({ status: "Post Updated", data: updatedPost });
    } else {
      res.status(404).send({ status: "Post not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: "Error with updating data" });
  }
};

export const updateCount = async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);
  const postCount = user.post_count;
  const newPost = Number(postCount) + 1;
  console.log(newPost);
  user.post_count = newPost;
  if (newPost >= 0 && newPost < 3) {
    user.badge = "Silver";
  } else if (newPost >= 3 && newPost < 7) {
    user.badge = "Gold";
  } else if (newPost >= 7) {
    user.badge = "Platinum";
  }
  await user.save();
};

export const updateCount2 = async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);
  const postCount = user.post_count;
  const newPost = Number(postCount) - 1;
  console.log(newPost);
  user.post_count = newPost;
  if (user.post_count >= 0 && user.post_count <= 3) {
    user.badge = "Silver";
    console.log("Silver");
  } else if (user.post_count > 3 && user.post_count <= 7) {
    user.badge = "Gold";
    console.log("Gold");
  } else if (user.post_count > 7) {
    user.badge = "Platinum";
    console.log("Platinum");
  }
  console.log(user.badge);
  await user.save();
};
