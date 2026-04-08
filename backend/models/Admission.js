const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Admission = sequelize.define('Admission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  formDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  academicYear: { type: DataTypes.STRING(20) },
  formNo: { type: DataTypes.STRING(50) },
  regNo: { type: DataTypes.STRING(50) },

  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  fatherName: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  motherName: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  dob: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },

  mobile: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },

  altMobile: { type: DataTypes.STRING(15) },
  religion: { type: DataTypes.STRING(50) },

  grade: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },

  studentAadhaar: { type: DataTypes.STRING(20) },
  fatherAadhaar: { type: DataTypes.STRING(20) },
  motherAadhaar: { type: DataTypes.STRING(20) },

  permanentAddress: { type: DataTypes.TEXT },
  currentAddress: { type: DataTypes.TEXT },
  phoneOrEmail: { type: DataTypes.STRING },

  relativeName: { type: DataTypes.STRING },
  relativeMobile: { type: DataTypes.STRING(15) },
  relativeAddress: { type: DataTypes.TEXT },

  marathiReading: { type: DataTypes.STRING(20) },
  englishReading: { type: DataTypes.STRING(20) },
  tablesKnowledge: { type: DataTypes.STRING(20) },
  spiritualEducation: { type: DataTypes.STRING(20) },

  hobbies: { type: DataTypes.STRING },
  parentExpectations: { type: DataTypes.TEXT },

  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'approved', 'rejected'),
    defaultValue: 'pending',
  },

}, {
  tableName: 'admissions',
  timestamps: true, // ✅ IMPORTANT
});

module.exports = Admission;