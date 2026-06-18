const cron = require("node-cron");
const { Op } = require("sequelize");

const Holiday = require("../models/holidayCalendarModel");
const User = require("../models/userModel");
const emailService = require("./emailService");

/* -----------------------------
   CORE HOLIDAY REMINDER LOGIC
----------------------------- */
const sendHolidayReminders = async () => {
  try {
    const today = new Date();

    const startRange = new Date();
    const endRange = new Date();

    // next 3 days range
    startRange.setDate(today.getDate() + 1);
    endRange.setDate(today.getDate() + 3);

    const upcomingHolidays = await Holiday.findAll({
      where: {
        holidayDate: {
          [Op.between]: [startRange, endRange],
        },
        isActive: true,
      },
    });

    if (!upcomingHolidays.length) {
      console.log("No upcoming holidays found");
      return;
    }

    const employees = await User.findAll({
      where: { role: "employee" },
    });

    /* -----------------------------
       SEND EMAIL TO ALL EMPLOYEES
    ----------------------------- */
    for (const holiday of upcomingHolidays) {
      for (const emp of employees) {
        await emailService.sendEmail({
          to: emp.email,
          subject: `🎉 Upcoming Holiday: ${holiday.holidayName}`,
          text: `
Hello ${emp.firstname},

This is a reminder that a holiday is coming soon:

Holiday: ${holiday.holidayName}
Date: ${holiday.holidayDate}
Type: ${holiday.holidayType || "N/A"}

Please plan your work accordingly.

Thanks,
HR System
          `,
        });
      }
    }

    console.log("Holiday reminders sent successfully");
  } catch (err) {
    console.error("Holiday Reminder Error:", err.message);
  }
};

/* -----------------------------
   CRON SCHEDULER
   Runs every day at 8 AM
----------------------------- */
const startHolidayReminderCron = () => {
  if (process.env.ENABLE_HOLIDAY_REMINDERS !== "true") {
    console.log("Holiday reminder cron disabled");
    return;
  }

  cron.schedule("0 8 * * *", async () => {
    console.log("Running Holiday Reminder Cron...");
    await sendHolidayReminders();
  });

  console.log("Holiday Reminder Cron Started (8 AM daily)");
};

/* -----------------------------
   MANUAL TRIGGER
----------------------------- */
const triggerHolidayReminders = async (req, res) => {
  try {
    await sendHolidayReminders();

    res.json({
      success: true,
      message: "Holiday reminders triggered manually",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  startHolidayReminderCron,
  triggerHolidayReminders,
};