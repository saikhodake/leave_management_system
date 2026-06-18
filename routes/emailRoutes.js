const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/userAuthMiddleware");
const EmailData = require("../models/emailModel");

/* -----------------------------
   GET ALL EMAILS (LEAVE REQUESTS)
   GET /api/emails/allemails
   ADMIN ONLY
----------------------------- */
router.get(
  "/allemails",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const emails = await EmailData.findAll({
        order: [["createdAt", "DESC"]],
      });

      res.json({
        success: true,
        count: emails.length,
        data: emails,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

module.exports = router;