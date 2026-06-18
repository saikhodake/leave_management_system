const cron = require("node-cron");
const { Op } = require("sequelize");

const EmailData = require("../models/emailModel");
const User = require("../models/userModel");
const emailService = require("./emailService");

/* -----------------------------
   CORE REMINDER LOGIC
----------------------------- */
const sendLeaveReminders = async () => {
  try {
    const today = new Date();

    // Find pending leaves that are close to start date (next 3 days)
    const upcomingDate = new Date();
    upcomingDate.setDate(today.getDate() + 3);

    const pendingLeaves = await EmailData.findAll({
      where: {
        status: "Pending",
        startDate: {
          [Op.lte]: upcomingDate,
        },
      },
    });

    if (!pendingLeaves.length) {
      console.log("No pending leave reminders");
      return;
    }

    // Get all admins
    const admins = await User.findAll({
      where: { role: "admin" },
    });

    /* -----------------------------
       LOOP THROUGH LEAVES
    ----------------------------- */
    for (const leave of pendingLeaves) {
      const employee = await User.findByPk(leave.employeeId);

      /* -----------------------------
         EMAIL TO ADMINS
      ----------------------------- */
      for (const admin of admins) {
        await emailService.sendEmail({
          to: admin.email,
          subject: `⚠ Pending Leave Approval - ${employee?.firstname || "Employee"}`,
          text: `
Leave request pending approval:

Employee: ${leave.employeeName}
Email: ${leave.employeeEmail}
Type: ${leave.leaveType}
Duration: ${leave.leaveDuration}
Start Date: ${leave.startDate}

Please review it in admin panel.
          `,
        });
      }

      /* -----------------------------
         EMAIL TO EMPLOYEE
      ----------------------------- */
      if (employee) {
        await emailService.sendEmail({
          to: employee.email,
          subject: `⏰ Your Leave is Pending Approval`,
          text: `
Hello ${employee.firstname},

Your leave request starting on ${leave.startDate} is still pending approval.

Please wait or contact admin if urgent.

Thanks,
HR System
          `,
        });
      }
    }

    console.log("Leave reminders sent successfully");
  } catch (err) {
    console.error("Leave Reminder Error:", err.message);
  }
};

/* -----------------------------
   CRON JOB SCHEDULER
   Runs every day at 9 AM
----------------------------- */
const startLeaveReminderCron = () => {
  if (process.env.ENABLE_LEAVE_REMINDERS !== "true") {
    console.log("Leave reminder cron disabled");
    return;
  }

  cron.schedule("0 9 * * *", async () => {
    console.log("Running Leave Reminder Cron...");
    await sendLeaveReminders();
  });

  console.log("Leave Reminder Cron Started (9 AM daily)");
};

/* -----------------------------
   MANUAL TRIGGER SUPPORT
----------------------------- */
const triggerLeaveReminders = async (req, res) => {
  try {
    await sendLeaveReminders();

    res.json({
      success: true,
      message: "Leave reminders triggered manually",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  startLeaveReminderCron,
  triggerLeaveReminders,
};