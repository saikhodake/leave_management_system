"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("holiday_calendars", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      holidayName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      holidayDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      holidayType: {
        type: Sequelize.ENUM(
          "Public",
          "Optional",
          "Restricted",
          "Festival",
          "National Holiday"
        ),
      },

      description: {
        type: Sequelize.TEXT,
      },

      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "SET NULL",
      },

      updatedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "SET NULL",
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

    await queryInterface.addConstraint("holiday_calendars", {
      fields: ["holidayName", "holidayDate"],
      type: "unique",
      name: "unique_holiday_name_date",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("holiday_calendars");
  },
};