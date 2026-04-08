const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');

class User extends Model {
  // Compare entered password with hashed password
  async comparePassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    fullName: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },

    mobile: { 
      type: DataTypes.STRING, 
      allowNull: false,
      unique: true 
    },

    email: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true,
      validate: { isEmail: true }
    },

    password: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },

    role: { 
      type: DataTypes.STRING, 
      defaultValue: 'student' 
    },

    // OTP / reset token fields
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'User',
    timestamps: true,

    defaultScope: {
      attributes: { exclude: ['password'] }
       // hide password by default
    },

    scopes: {
      withPassword: { attributes: { include: ['password'] } }
    }
  }
);

// 🔐 Hash password before saving a new user
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

// 🔐 Hash password if updated
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.prototype.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;