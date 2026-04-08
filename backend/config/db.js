const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',

    logging: false,

    // ✅ connection pool (important for performance)
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },

    // ✅ fix timezone issues
    timezone: '+05:30',
  }
);

module.exports = sequelize;