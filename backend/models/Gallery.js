const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Gallery = sequelize.define('Gallery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  titleMr: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },

  titleEn: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },

  imageUrl: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },

  category: {
    type: DataTypes.ENUM('general', 'students', 'events', 'campus', 'ceremony'),
    defaultValue: 'general',
  },

  addedBy: {
    type: DataTypes.INTEGER,
    field: 'added_by',
    allowNull: true  // ✅ Allow NULL if user doesn't exist
  }

}, {
  tableName: 'galleries',
  timestamps: true
});

// ✅ RELATION (VERY IMPORTANT)
User.hasMany(Gallery, { foreignKey: 'addedBy' });
Gallery.belongsTo(User, { foreignKey: 'addedBy' });

module.exports = Gallery;
