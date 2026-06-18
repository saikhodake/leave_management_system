const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/userAuthMiddleware");
const {
  uploadLeaveAttachments,
} = require("../middlewares/uploadMiddleware");
const { Op } = require("sequelize");

const EmailData = require("../models/emailModel");

/* -----------------------------
   CREATE LEAVE REQUEST
   POST /api/employee/leave-email
----------------------------- */
router.post(
  "/leave-email",
  authMiddleware.verifyToken,
  uploadLeaveAttachments,
  async (req, res) => {
    try {
      const {
        subject,
        leaveReason,
        leaveType,
        leaveDuration,
        halfDayType,
        startDate,
        endDate,
      } = req.body;

      if (!subject || !leaveReason || !leaveType || !leaveDuration) {
        return res.status(400).json({
          success: false,
          message: "Required fields missing",
        });
      }

      const leave = await EmailData.create({
        employeeId: req.user.id,
        employeeName: `${req.user.firstname} ${req.user.lastname}`,
        employeeEmail: req.user.email,
        subject,
        leaveReason,
        leaveType,
        leaveDuration,
        halfDayType: halfDayType || null,
        startDate,
        endDate,
        status: "Pending",

        attachments: req.files
          ? req.files.map((file) => ({
              filename: file.filename,
              mimetype: file.mimetype,
              size: file.size,
              path: file.path,
              uploadedAt: new Date(),
            }))
          : [],

        submissionCount: 1,
        isPaid: true,
      });

      res.status(201).json({
        success: true,
        message: "Leave request submitted successfully",
        data: leave,
      });
    } catch (err) {
      console.error("Create Leave Error:", err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);
/* -----------------------------
   GET MY LEAVES
   GET /api/employee/leave-email
----------------------------- */
router.get(
  "/leave-email",
  authMiddleware.verifyToken,
  async (req, res) => {
    try {
      const leaves = await EmailData.findAll({
        where: { employeeId: req.user.id },
        order: [["createdAt", "DESC"]],
      });

      res.json({
        success: true,
        data: leaves,
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
   GET SINGLE LEAVE
   GET /api/employee/leave-email/:id
----------------------------- */
router.get(
  "/leave-email/:id",
  authMiddleware.verifyToken,
  async (req, res) => {
    try {
      const leave = await EmailData.findOne({
        where: {
          id: req.params.id,
          employeeId: req.user.id,
        },
      });

      if (!leave) {
        return res.status(404).json({
          success: false,
          message: "Leave not found",
        });
      }

      res.json({
        success: true,
        data: leave,
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
   CANCEL LEAVE
   POST /api/employee/leave-email/:id/cancel
----------------------------- */
router.post(
  "/leave-email/:id/cancel",
  authMiddleware.verifyToken,
  async (req, res) => {
    try {
      const leave = await EmailData.findOne({
        where: {
          id: req.params.id,
          employeeId: req.user.id,
        },
      });

      if (!leave) {
        return res.status(404).json({
          success: false,
          message: "Leave not found",
        });
      }

      if (leave.status !== "Pending") {
        return res.status(400).json({
          success: false,
          message: "Only pending leaves can be cancelled",
        });
      }

      await leave.update({
        status: "Cancelled",
      });

      res.json({
        success: true,
        message: "Leave cancelled successfully",
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
   RESUBMIT LEAVE
   POST /api/employee/leave-email/:id/resubmit
----------------------------- */
router.post(
  "/leave-email/:id/resubmit",
  authMiddleware.verifyToken,
  async (req, res) => {
    try {
      const { leaveReason } = req.body;

      const leave = await EmailData.findOne({
        where: {
          id: req.params.id,
          employeeId: req.user.id,
        },
      });

      if (!leave) {
        return res.status(404).json({
          success: false,
          message: "Leave not found",
        });
      }

      if (leave.status !== "Rejected") {
        return res.status(400).json({
          success: false,
          message: "Only rejected leaves can be resubmitted",
        });
      }

      await leave.update({
        leaveReason: leaveReason || leave.leaveReason,
        status: "Pending",
        submissionCount: (leave.submissionCount || 1) + 1,
      });

      res.json({
        success: true,
        message: "Leave resubmitted successfully",
        data: leave,
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