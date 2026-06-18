"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("client_projects", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      companyName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      clientName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      projectTitle: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      projectDescription: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      endDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      deadline: {
        type: Sequelize.DATE,
      },

      meetings: {
        type: Sequelize.JSONB,
        defaultValue: [],
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
    await queryInterface.dropTable("client_projects");
  },
};