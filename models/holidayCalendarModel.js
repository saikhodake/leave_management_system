const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const HolidayCalendar = sequelize.define(
  "HolidayCalendar",
  {
    holidayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    holidayDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    holidayType: {
      type: DataTypes.ENUM(
        "Public",
        "Optional",
        "Restricted",
        "Festival",
        "National Holiday"
      ),
    },

    description: {
      type: DataTypes.TEXT,
    },

    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "holiday_calendars",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["holidayName", "holidayDate"],
      },
    ],
  }
);

module.exports = HolidayCalendar;