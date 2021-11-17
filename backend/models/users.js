const { Sequelize , UUIDV4, DataTypes } = require("sequelize");
var bcrypt = require('bcryptjs');
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4
    },
    username: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "s"
    },
    flag: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    clearnace: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    mode: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "normal"
    }
  });
  users.createUser = async (newUser) => {
    bcrypt.genSalt(10, async (err, salt) => {
      bcrypt.hash(newUser.password, salt, async (err, hash) => {
        if (hash) {
          const getUser = await users.findOne({ where: { uuid: newUser.uuid } })
          getUser.password = hash;
          await getUser.save();
          newUser = getUser;
        }
      })
    })
    return newUser;
  }
  users.getUserById = async (_id) => {
    return await users.findOne({ where: { id: _id } }) 
  }
  users.getUserByEmail = async (_email) => {
    return await users.findOne({ where: { email: _email } })
  }
  users.comparePassword = async (myPassword, hash, cb) => {
    bcrypt.compare(myPassword, hash, function (err, isMatch) {
      if (err) throw err;
      return cb(null, isMatch)
    })
  }
  return users;
}