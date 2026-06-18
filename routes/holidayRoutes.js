const express = require("express");
const router = express.Router();

const { Op } = require("sequelize");
const fs = require("fs");
const csv = require("csv-parser");

const authMiddleware = require("../middlewares/userAuthMiddleware");
const csvUpload = require("../middlewares/CsvuploadMiddleware");

const Holiday = require("../models/holidayCalendarModel");
const User = require("../models/userModel");

/* -----------------------------
   CREATE HOLIDAY (ADMIN)
----------------------------- */
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const { holidayName, holidayDate, holidayType, description, year } =
        req.body;

      const holiday = await Holiday.create({
        holidayName,
        holidayDate,
        holidayType,
        description,
        year,
      });

      res.status(201).json({
        success: true,
        message: "Holiday created",
        data: holiday,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   CSV BULK UPLOAD
----------------------------- */
router.post(
  "/upload-csv",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  csvUpload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "CSV file required",
        });
      }

      const results = [];

      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          try {
            const holidays = results.map((h) => ({
              holidayName: h.holidayName,
              holidayDate: h.holidayDate,
              holidayType: h.holidayType,
              description: h.description,
              year: h.year,
            }));

            await Holiday.bulkCreate(holidays);

            res.json({
              success: true,
              message: "CSV uploaded successfully",
              count: holidays.length,
            });
          } catch (err) {
            res.status(500).json({ success: false, message: err.message });
          }
        });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   GET ALL HOLIDAYS
----------------------------- */
router.get(
  "/",
  authMiddleware.verifyToken,
  async (req, res) => {
    try {
      const { year, holidayType } = req.query;

      const where = {};

      if (year) where.year = year;
      if (holidayType) where.holidayType = holidayType;

      const holidays = await Holiday.findAll({
        where,
        order: [["holidayDate", "ASC"]],
      });

      res.json({
        success: true,
        data: holidays,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   HOLIDAY STATS
----------------------------- */
router.get(
  "/stats",
  authMiddleware.verifyToken,
  async (req, res) => {
    try {
      const stats = await Holiday.findAll({
        attributes: [
          "year",
          "holidayType",
          [
            Holiday.sequelize.fn("COUNT", "*"),
            "total",
          ],
        ],
        group: ["year", "holidayType"],
      });

      res.json({
        success: true,
        data: stats,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   GET HOLIDAY BY ID
----------------------------- */
router.get(
  "/:id",
  authMiddleware.verifyToken,
  async (req, res) => {
    try {
      const holiday = await Holiday.findByPk(req.params.id);

      if (!holiday) {
        return res.status(404).json({
          success: false,
          message: "Holiday not found",
        });
      }

      res.json({ success: true, data: holiday });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   UPDATE HOLIDAY (ADMIN)
----------------------------- */
router.put(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const holiday = await Holiday.findByPk(req.params.id);

      if (!holiday) {
        return res.status(404).json({
          success: false,
          message: "Holiday not found",
        });
      }

      await holiday.update(req.body);

      res.json({
        success: true,
        message: "Holiday updated",
        data: holiday,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   DELETE HOLIDAY (ADMIN)
----------------------------- */
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      await Holiday.destroy({
        where: { id: req.params.id },
      });

      res.json({
        success: true,
        message: "Holiday deleted",
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   DELETE BY YEAR (ADMIN)
----------------------------- */
router.delete(
  "/year/:year",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      await Holiday.destroy({
        where: { year: req.params.year },
      });

      res.json({
        success: true,
        message: "All holidays deleted for year",
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* -----------------------------
   TRIGGER REMINDER (ADMIN)
----------------------------- */
router.post(
  "/trigger-reminder",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      // Hook your holidayReminderService.js here

      res.json({
        success: true,
        message: "Holiday reminder triggered",
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;