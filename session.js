const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Session = sequelize.define('Session', {
  sid: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  data: DataTypes.TEXT,
  expires: DataTypes.DATE,
}, {
  tableName: 'sessions',
});

module.exports = Session;
