const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Email = sequelize.define(
  "Email",
  {
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    employeeName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    employeeEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue(
          "employeeEmail",
          value.toLowerCase()
        );
      },
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    leaveReason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    leaveType: {
      type: DataTypes.ENUM(
        "Sick Leave",
        "Casual Leave",
        "Emergency Leave"
      ),
      allowNull: false,
    },

    leaveDuration: {
      type: DataTypes.ENUM(
        "Full Day",
        "Half Day"
      ),
      allowNull: false,
    },

    halfDayType: {
      type: DataTypes.ENUM(
        "First Half",
        "Second Half"
      ),
    },

    startDate: {
      type: DataTypes.DATE,
    },

    endDate: {
      type: DataTypes.DATE,
    },

    status: {
      type: DataTypes.ENUM(
        "Pending",
        "Approved",
        "Rejected"
      ),
      defaultValue: "Pending",
    },

    adminRemarks: {
      type: DataTypes.TEXT,
    },

    reviewedBy: {
      type: DataTypes.INTEGER,
    },

    reviewedAt: {
      type: DataTypes.DATE,
    },

    rawEmailId: {
      type: DataTypes.STRING,
      unique: true,
    },

    attachments: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },

    rejectionReason: {
      type: DataTypes.TEXT,
    },

    submissionCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },

    rejectionHistory: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },

    isPaid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    balanceDeducted: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    deductedFrom: {
      type: DataTypes.ENUM(
        "monthly quota",
        "CL",
        "SL",
        "Unpaid"
      ),
    },

    leaveDays: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    tableName: "emails",
    timestamps: true,
  }
);

module.exports = Email;