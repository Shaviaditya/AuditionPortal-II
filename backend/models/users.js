const { UUIDV4, DataTypes } = require("sequelize");
const bcrypt = require('bcryptjs');
module.exports = (sequelize) => {
  const users = sequelize.define('users', {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
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
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "unevaluated"
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
    },
    round: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    time: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    feedback: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
      allowNull: true
    },
    phone: {
      type: DataTypes.BIGINT,
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
    let param1 = _id.id, param2 = _id.uuid;
    if (param1 != undefined && param2 != undefined)
      return await users.findOne({ where: { uuid: ((param1.length > param2.length) ? (param1) : (param2)) } })
    else if (param1 != undefined && param2 == undefined)
      return await users.findOne({ where: { uuid: param1 } })
    else
      return await users.findOne({ where: { uuid: param2 } })
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