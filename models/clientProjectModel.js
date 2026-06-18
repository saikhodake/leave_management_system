const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ClientProject = sequelize.define(
  "ClientProject",
  {
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    clientName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    projectTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    projectDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    deadline: {
      type: DataTypes.DATE,
    },

    meetings: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },

    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "client_projects",
    timestamps: true,
  }
);

module.exports = ClientProject;