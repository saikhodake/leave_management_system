"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      firstname: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      middlename: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      lastname: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      mobile: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      role: {
        type: Sequelize.ENUM("employee", "admin"),
        defaultValue: "employee",
      },

      clBalance: {
        type: Sequelize.INTEGER,
        defaultValue: 20,
      },

      slBalance: {
        type: Sequelize.INTEGER,
        defaultValue: 5,
      },

      totalPaidLeaves: {
        type: Sequelize.INTEGER,
        defaultValue: 25,
      },

      currentMonth: {
        type: Sequelize.STRING,
      },

      currentMonthPaidFull: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      currentMonthPaidHalf: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      currentMonthUnpaidLeaves: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      previousMonthBalanceFull: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      previousMonthBalanceHalf: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      totalUnpaidLeaves: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      leaveHistory: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },

      profilePhoto: {
        type: Sequelize.STRING,
      },

      passwordResetToken: {
        type: Sequelize.STRING,
      },

      passwordResetExpires: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("users");
  },
};