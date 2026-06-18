const sequelize = require("../config/config");
const User = require("../models/userModel");

const run = async () => {
  try {
    await sequelize.authenticate();

    console.log("Database connected");

    const users = await User.findAll();

    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

    for (const user of users) {
      await user.update({
        // Carry forward unused balances
        previousMonthBalanceFull:
          user.currentMonthPaidFull
            ? Math.max(0, 1 - user.currentMonthPaidFull)
            : user.previousMonthBalanceFull,

        previousMonthBalanceHalf:
          user.currentMonthPaidHalf
            ? Math.max(0, 1 - user.currentMonthPaidHalf)
            : user.previousMonthBalanceHalf,

        // Reset current month usage
        currentMonthPaidFull: 0,
        currentMonthPaidHalf: 0,
        currentMonthUnpaidLeaves: 0,

        // Update month tracker
        currentMonth,
      });
    }

    console.log("Monthly balances updated successfully");
    process.exit(0);
  } catch (err) {
    console.error("Balance update error:", err.message);
    process.exit(1);
  }
};

run();