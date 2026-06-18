const express = require("express");
const router = express.Router();

const { Op } = require("sequelize");

const authMiddleware = require("../middlewares/userAuthMiddleware");
const EmailData = require("../models/emailModel");
const User = require("../models/userModel");

/* -----------------------------
   GET ALL LEAVE REQUESTS
----------------------------- */
router.get(
  "/leave-requests",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const { status, employeeId } = req.query;

      const where = {};

      if (status) where.status = status;
      if (employeeId) where.employeeId = employeeId;

      const data = await EmailData.findAll({
        where,
        order: [["createdAt", "DESC"]],
      });

      res.json({
        success: true,
        data,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   GET SINGLE LEAVE
----------------------------- */
router.get(
  "/leave-requests/:id",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const leave = await EmailData.findByPk(req.params.id);

      if (!leave) {
        return res.status(404).json({
          success: false,
          message: "Leave not found",
        });
      }

      res.json({ success: true, data: leave });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   APPROVE LEAVE
----------------------------- */
router.post(
  "/leave-requests/:id/approve",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const leave = await EmailData.findByPk(req.params.id);
      if (!leave) {
        return res.status(404).json({ message: "Leave not found" });
      }

      if (leave.status !== "Pending") {
        return res.status(400).json({
          message: "Already processed",
        });
      }

      const user = await User.findByPk(leave.employeeId);

      if (user) {
        let deduction = 0;

        if (leave.leaveDuration === "Full Day") deduction = 1;
        if (leave.leaveDuration === "Half Day") deduction = 0.5;

        user.clBalance = Math.max(0, user.clBalance - deduction);

        await user.save();
      }

      await leave.update({
        status: "Approved",
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      });

      res.json({
        success: true,
        message: "Leave approved",
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   REJECT LEAVE
----------------------------- */
router.post(
  "/leave-requests/:id/reject",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const { rejectionReason } = req.body;

      const leave = await EmailData.findByPk(req.params.id);

      if (!leave) {
        return res.status(404).json({ message: "Leave not found" });
      }

      await leave.update({
        status: "Rejected",
        rejectionReason,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      });

      res.json({
        success: true,
        message: "Leave rejected",
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   STATS
----------------------------- */
router.get(
  "/stats",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const pending = await EmailData.count({
        where: { status: "Pending" },
      });

      const approved = await EmailData.count({
        where: { status: "Approved" },
      });

      const rejected = await EmailData.count({
        where: { status: "Rejected" },
      });

      res.json({
        success: true,
        data: { pending, approved, rejected },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   EMPLOYEES ON LEAVE TODAY
----------------------------- */
router.get(
  "/calendar/employees-on-leave-today",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const today = new Date();

      const data = await EmailData.findAll({
        where: {
          status: "Approved",
          startDate: { [Op.lte]: today },
          endDate: { [Op.gte]: today },
        },
      });

      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   UPCOMING LEAVES
----------------------------- */
router.get(
  "/calendar/upcoming-leaves",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const days = parseInt(req.query.days || 7);

      const future = new Date();
      future.setDate(future.getDate() + days);

      const data = await EmailData.findAll({
        where: {
          status: "Approved",
          startDate: {
            [Op.between]: [new Date(), future],
          },
        },
      });

      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   UPDATE LEAVE (CALENDAR EDIT)
----------------------------- */
router.put(
  "/calendar/leave/:id",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const leave = await EmailData.findByPk(req.params.id);

      if (!leave) {
        return res.status(404).json({ message: "Not found" });
      }

      await leave.update(req.body);

      res.json({ success: true, message: "Updated", data: leave });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   DELETE LEAVE
----------------------------- */
router.delete(
  "/calendar/leave/:id",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      await EmailData.destroy({
        where: { id: req.params.id },
      });

      res.json({ success: true, message: "Deleted" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   EMPLOYEE LEAVE SUMMARY
----------------------------- */
router.get(
  "/employees/leave-summary",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: [
          "id",
          "firstname",
          "lastname",
          "email",
          "clBalance",
          "slBalance",
          "totalUnpaidLeaves",
        ],
      });

      res.json({ success: true, data: users });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   SINGLE EMPLOYEE REPORT
----------------------------- */
router.get(
  "/employees/:id/detailed-report",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      const leaves = await EmailData.findAll({
        where: { employeeId: req.params.id },
      });

      res.json({
        success: true,
        user,
        leaves,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   SINGLE EMPLOYEE PROFILE
----------------------------- */
router.get(
  "/employees/:id",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      res.json({ success: true, data: user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   MANUAL REMINDER TRIGGER
----------------------------- */
router.post(
  "/trigger-leave-reminders",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      // You already have leaveReminderService.js
      // You can call it here if exported

      res.json({
        success: true,
        message: "Reminder triggered (hook service here)",
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;