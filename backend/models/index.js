const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const models = [
  require('./users')(sequelize),
  require('./roundmodel')(sequelize),
  require('./question_set_model')(sequelize),
  require('./eventmodel')(sequelize),
  require('./question_answered_model')(sequelize),
  require('./answermodel')(sequelize),
  require('./dashmodel')(sequelize)
]

const {
  models: {
    roundmodel,
    question_set_model,
    answermodel,
    question_answered_model,
    dashmodel
  }
} = sequelize;
try {
  // Round Models => Questions Set Model (Each Round can have multiple questions of multiple types)
  roundmodel.hasMany(question_set_model, {
    foreignKey: {
      allowNull: false
    }
  })
  question_set_model.belongsTo(roundmodel, { constraints: true })
} catch (err) {
  console.log(err);
}

// Answer Model => Question-Answer Models Connection (Each Student can answer multiple questions so to store his responses round wise)
try {
  answermodel.hasMany(question_answered_model, {
    foreignKey: {
      allowNull: false
    }
  })
  question_answered_model.belongsTo(answermodel)
} catch (error) {
  console.log(error)
}
// Dash Model => Answer Model Connection (Each Student can answer multiple questions so to store his responses round wise)
try {
  dashmodel.hasMany(answermodel, {
    foreignKey: {
      allowNull: false
    }
  })
  answermodel.belongsTo(dashmodel)
} catch (error) {
  console.log(error)
}

module.exports = { sequelize, models };