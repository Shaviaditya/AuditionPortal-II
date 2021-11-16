'use strict';

module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('question_set_models', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      roundId:{
        type: DataTypes.INTEGER,
        allowNull: false
      },
      quesText: {
        type: DataTypes.STRING,
        allowNull: false
      },
      quesLink: {
        type: DataTypes.STRING,
        allowNull: true
      },
      quesType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      options: {
        type: DataTypes.STRING,
        allowNull: true
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.dropTable('question_set_models');
  }
};