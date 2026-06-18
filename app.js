require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const sequelize = require("./config/database");

/* -----------------------------
   ROUTES
----------------------------- */
const authRoutes = require("./routes/userAuthRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const holidayRoutes = require("./routes/holidayRoutes");
const clientProjectRoutes = require("./routes/clientProjectRoutes");
const emailRoutes = require("./routes/emailRoutes");

/* -----------------------------
   SERVICES
----------------------------- */
const { startEmailListener } = require("./services/mailParser");
const { startLeaveReminderCron } = require("./services/leaveReminderService");
const { startHolidayReminderCron } = require("./services/holidayReminderService");

/* -----------------------------
   APP INIT
----------------------------- */
const app = express();

/* -----------------------------
   MIDDLEWARES
----------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));

/* -----------------------------
   STATIC FILES (UPLOADS)
----------------------------- */
app.use("/uploads", express.static("uploads"));

/* -----------------------------
   HEALTH CHECK
----------------------------- */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Leave Management API is running ",
  });
});

/* -----------------------------z
   API ROUTES
----------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/client-project", clientProjectRoutes);
app.use("/api/emails", emailRoutes);

/* -----------------------------
   DATABASE CONNECTION
----------------------------- */
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.error("DB connection error", err);
  });

/* -----------------------------
   SYNC MODELS (OPTIONAL)
   use only in dev
----------------------------- */
sequelize.sync();

/* -----------------------------
   START SERVICES (ONLY IF ENABLED)
----------------------------- */
if (process.env.ENABLE_EMAIL === "true") {
  startEmailListener();
}

startLeaveReminderCron();
startHolidayReminderCron();

/* -----------------------------
   START SERVER
----------------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} `);
});