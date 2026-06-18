const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    middlename: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      set(value) {
        this.setDataValue("email", value.toLowerCase());
      },
    },

    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM("employee", "admin"),
      defaultValue: "employee",
    },

    clBalance: {
      type: DataTypes.INTEGER,
      defaultValue: 20,
    },

    slBalance: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },

    totalPaidLeaves: {
      type: DataTypes.INTEGER,
      defaultValue: 25,
    },

    currentMonth: {
      type: DataTypes.STRING,
    },

    currentMonthPaidFull: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    currentMonthPaidHalf: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    currentMonthUnpaidLeaves: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    previousMonthBalanceFull: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    previousMonthBalanceHalf: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    totalUnpaidLeaves: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    leaveHistory: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },

    profilePhoto: {
      type: DataTypes.STRING,
    },

    passwordResetToken: {
      type: DataTypes.STRING,
    },

    passwordResetExpires: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

// Hash password before save
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

module.exports = User;