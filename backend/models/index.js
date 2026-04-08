const sequelize = require('../config/db');

const User = require('./User');
const Admission = require('./Admission');
const Gallery = require('./Gallery');
const Update = require('./Update');

// Relationships
User.hasMany(Admission, { foreignKey: 'userId' });
Admission.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Gallery, { foreignKey: 'addedBy' });
Gallery.belongsTo(User, { foreignKey: 'addedBy' });

User.hasMany(Update, { foreignKey: 'addedBy' });
Update.belongsTo(User, { foreignKey: 'addedBy' });

module.exports = {
  sequelize,
  User,
  Admission,
  Gallery,
  Update
};