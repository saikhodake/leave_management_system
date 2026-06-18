"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("emails", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "SET NULL",
      },

      employeeName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      employeeEmail: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      subject: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      leaveReason: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      leaveType: {
        type: Sequelize.ENUM(
          "Sick Leave",
          "Casual Leave",
          "Emergency Leave"
        ),
        allowNull: false,
      },

      leaveDuration: {
        type: Sequelize.ENUM(
          "Full Day",
          "Half Day"
        ),
        allowNull: false,
      },

      halfDayType: {
        type: Sequelize.ENUM(
          "First Half",
          "Second Half"
        ),
      },

      startDate: {
        type: Sequelize.DATE,
      },

      endDate: {
        type: Sequelize.DATE,
      },

      status: {
        type: Sequelize.ENUM(
          "Pending",
          "Approved",
          "Rejected"
        ),
        defaultValue: "Pending",
      },

      adminRemarks: {
        type: Sequelize.TEXT,
      },

      reviewedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "SET NULL",
      },

      reviewedAt: {
        type: Sequelize.DATE,
      },

      rawEmailId: {
        type: Sequelize.STRING,
        unique: true,
      },

      attachments: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },

      rejectionReason: {
        type: Sequelize.TEXT,
      },

      submissionCount: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },

      rejectionHistory: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },

      isPaid: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },

      balanceDeducted: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },

      deductedFrom: {
        type: Sequelize.ENUM(
          "monthly quota",
          "CL",
          "SL",
          "Unpaid"
        ),
      },

      leaveDays: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("emails");
  },
};