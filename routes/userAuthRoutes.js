const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/userModel");
const authMiddleware = require("../middlewares/userAuthMiddleware");
const {
uploadSingleProfilePhoto,
} = require("../middlewares/uploadMiddleware");
const emailService = require("../services/emailService");

/* -----------------------------
   REGISTER
----------------------------- */
// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const {
      firstname,
      middlename,
      lastname,
      email,
      mobile,
      password,
      role,
    } = req.body;

    if (!firstname || !lastname || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const existing = await User.findOne({ where: { email } });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const user = await User.create({
      firstname,
      middlename,
      lastname,
      email,
      mobile,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* -----------------------------
   LOGIN (JWT TOKEN)
----------------------------- */
// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* -----------------------------
   LOGOUT (frontend clears token)
----------------------------- */
// GET /api/auth/logout
router.get("/logout", async (req, res) => {
  return res.json({
    success: true,
    message: "Logout successful (delete token on client)",
  });
});

/* -----------------------------
   PROFILE
----------------------------- */
// GET /api/auth/profile
router.get("/profile", authMiddleware.verifyToken, async (req, res) => {
  try {
    return res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* -----------------------------
   UPDATE PROFILE
----------------------------- */
// PUT /api/auth/profile
router.put("/profile", authMiddleware.verifyToken, async (req, res) => {
  try {
    const { firstname, lastname, mobile } = req.body;

    await req.user.update({
      firstname: firstname ?? req.user.firstname,
      lastname: lastname ?? req.user.lastname,
      mobile: mobile ?? req.user.mobile,
    });

    res.json({
      success: true,
      message: "Profile updated",
      user: req.user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* -----------------------------
   PROFILE PHOTO UPLOAD
----------------------------- */
// POST /api/auth/profile/photo
router.post(
  "/profile/photo",
  authMiddleware.verifyToken,
  uploadSingleProfilePhoto,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      await req.user.update({
        profilePhoto: req.file.path,
      });

      res.json({
        success: true,
        message: "Profile photo updated",
        file: req.file,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

/* -----------------------------
   CHANGE PASSWORD
----------------------------- */
// POST /api/auth/change-password
router.post(
  "/change-password",
  authMiddleware.verifyToken,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const isMatch = await bcrypt.compare(
        currentPassword,
        req.user.password
      );

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password incorrect",
        });
      }

      const hashed = await bcrypt.hash(newPassword, 10);

      await req.user.update({
        password: hashed,
      });

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

/* -----------------------------
   FORGOT PASSWORD
----------------------------- */
// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = await bcrypt.hash(resetToken, 10);

    await user.update({
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    const resetLink = `${process.env.FRONTEND_BASE_URL}/reset-password/${resetToken}`;

    await emailService.sendEmail({
      to: user.email,
      subject: "Password Reset",
      text: `Reset your password: ${resetLink}`,
    });

    res.json({
      success: true,
      message: "Reset link sent to email",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* -----------------------------
   RESET PASSWORD
----------------------------- */
// POST /api/auth/reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const users = await User.findAll();

    let matchedUser = null;

    for (let u of users) {
      const match = await bcrypt.compare(token, u.passwordResetToken || "");
      if (match) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    if (
      !matchedUser.passwordResetExpires ||
      matchedUser.passwordResetExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Token expired",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await matchedUser.update({
      password: hashed,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;