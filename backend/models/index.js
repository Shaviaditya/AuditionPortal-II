const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');
require('dotenv').config();
//const env = process.env.NODE_ENV || 'development';
//const config = require(__dirname + '/../config/config.json')[env];
// const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname') 
const sequelize = new Sequelize(process.env.ELEPHANTSQL);
const models = [
  require('./users')(sequelize),
  require('./roundmodel')(sequelize),
  require('./question_set_model')(sequelize),
  require('./eventmodel')(sequelize),
  require('./question_answered_model')(sequelize),
]
const {
  models: {
    users,
    roundmodel,
    question_set_model,
    question_answered_model,
  }
} = sequelize;

roundmodel.hasMany(question_set_model, {
  foreignKey: {
    allowNull: false
  },
  onDelete: 'CASCADE'
})
question_set_model.belongsTo(roundmodel, { constraints: true })

users.hasMany(question_answered_model, {
  foreignKey: {
    type: DataTypes.UUID,
    allowNull: false
  },
  onDelete: 'CASCADE'
})
question_answered_model.belongsTo(users);
module.exports = { sequelize, models };