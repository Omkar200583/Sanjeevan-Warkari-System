const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Update = sequelize.define('Update', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  dateLabel: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },

  titleMr: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },

  titleEn: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },

  bodyMr: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },

  bodyEn: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },

  addedBy: {
    type: DataTypes.INTEGER,
    field: 'added_by',
    allowNull: true  // ✅ CRITICAL: Change from false to true
  }

}, {
  tableName: 'updates',
  timestamps: true
});

// ✅ RELATIONS
User.hasMany(Update, { foreignKey: 'addedBy' });
Update.belongsTo(User, { foreignKey: 'addedBy' });

module.exports = Update;