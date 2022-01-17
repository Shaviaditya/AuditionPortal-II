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

/*users.hasMany(question_answered_model, {
  foreignKey: {
    type: DataTypes.UUID,
    allowNull: false
  },
  onDelete: 'CASCADE'
})*/
question_answered_model.belongsTo(users,{
    onDelete : 'CASCADE'
})

module.exports = { sequelize, models };