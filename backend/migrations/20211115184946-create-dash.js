'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('dashes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uuid: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      role: {
        type: Sequelize.STRING
      },
      round: {
        type: Sequelize.NUMBER
      },
      time: {
        type: Sequelize.NUMBER
      },
      feedback: {
        type: Sequelize.ARRAY
      },
      lastUser: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.NUMBER
      },
      roll: {
        type: Sequelize.STRING
      },
      profilebool: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('dashes');
  }
};