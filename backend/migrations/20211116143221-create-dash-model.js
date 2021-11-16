'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('dashmodels', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      uid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "unevaluated"
      },
      role: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "s"
      },
      round: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      time: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      feedback: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true
      },
      phone: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      lastUser: {
        type: DataTypes.STRING
      },
      roll: {
        type: DataTypes.STRING,
        allowNull: true
      },
      profilebool: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.dropTable('dashmodels');
  },
};