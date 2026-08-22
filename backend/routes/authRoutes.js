const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const User = require("../models/User");

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        path.extname(file.originalname)
    );
  },
});

console.log("AUTH ROUTES LOADED");
const upload = multer({
  storage,
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } =
      req.body;

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "User Registered",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user =
      await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        message: "Wrong password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* ==================================
   UPDATE PROFILE
================================== */
router.put(
  "/update-profile/:id",
  async (req, res) => {
    try {

      const {
        name,
        email,
        profileImage,
      } = req.body;

      const user =
        await User.findByIdAndUpdate(
          req.params.id,
          {
            name,
            email,
            profileImage,
          },
          {
            new: true,
          }
        );

      res.json({
        message:
          "Profile Updated",
        user,
      });

    } catch (error) {

      res.status(500).json({
        message:
          error.message,
      });

    }
  }
);

/* ==================================
   CHANGE PASSWORD
================================== */
router.put(
  "/change-password/:id",
  async (req, res) => {
    try {

      const {
        currentPassword,
        newPassword,
      } = req.body;

      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User not found",
          });
      }

      const isMatch =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (!isMatch) {
        return res
          .status(400)
          .json({
            message:
              "Current password is incorrect",
          });
      }

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

      user.password =
        hashedPassword;

      await user.save();

      res.json({
        message:
          "Password Updated Successfully",
      });

    } catch (error) {

      res.status(500).json({
        message:
          error.message,
      });

    }
  }
);

router.post(
  "/upload-profile",
  upload.single("image"),
  async (req, res) => {
    try {

      if (!req.file) {
        return res.status(400).json({
          message: "No image uploaded",
        });
      }

      res.json({
        image:
          `/uploads/${req.file.filename}`,
      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }
  }
);

router.post(
  "/upload-campaign",
  upload.single("image"),
  async (req, res) => {
    console.log("FILE:", req.file);
    try {

      if (!req.file) {
        return res.status(400).json({
          message: "No image uploaded",
        });
      }

      res.json({
        image:
          `/uploads/${req.file.filename}`,
      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }
  }
);

router.get("/test", (req, res) => {
  res.send("Auth Route Working");
});

module.exports = router;