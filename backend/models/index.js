const Sequelize = require('sequelize');
const {Sequelize} = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const models = [
  require('./users')(sequelize, Sequelize.DataTypes),
  require('./roundmodel')(sequelize, Sequelize.DataTypes),
  require('./question_set_model')(sequelize, Sequelize.DataTypes)
]

const {models : {roundmodel,question_set_model}} = sequelize;
try {
  roundmodel.hasMany(question_set_model,{
    foreignKey:'roundId',
    allowNull: false,
  })
  question_set_model.belongsTo(roundmodel,{foreignKey:'roundId'})
} catch (err) {
  console.log(err);
}

models.sequelize = sequelize;

module.exports = models;