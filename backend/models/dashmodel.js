/* 'use strict';
const {
  Model, Sequelize
} = require('sequelize');
const answermodel = require('./answermodel');
module.exports = (sequelize, DataTypes) => {
  class dashmodel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
    static associate({answermodel}) {
      // define association here
      // this.hasMany(answermodel,{ foreignKey: 'ansID', as: 'answers'})
    }
  };
  dashmodel.init({
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
    }
  }, {
    sequelize,
    modelName: 'dashmodel',
  });
  return dashmodel;
};
*/

import { DataTypes } from "sequelize/types";
import { sequelize } from ".";

export default (sequelize, DataTypes) => {
  const dashmodel = sequelize.define('dashmodel', {
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
    }
  });
  return dashmodel;
}