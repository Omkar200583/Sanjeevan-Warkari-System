const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Student = sequelize.define('Student', {
  
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    unique: true,
    validate: {
      isEmail: true
    }
  },

  // ✅ FIX: Renamed 'class' to 'grade' (class is a reserved SQL keyword)
  grade: {
    type: DataTypes.STRING
  },

  attendance: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  feesStatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },

  admissionStatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  }

}, {
  tableName: 'students',
  timestamps: true   // adds createdAt & updatedAt
});

module.exports = Student;
