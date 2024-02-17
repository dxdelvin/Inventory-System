const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '../public/database/sqlite', 
});

module.exports = sequelize;