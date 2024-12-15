// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('collab', 'root', '', {
    host: 'localhost', // or your remote database host
    dialect: 'mysql',
    logging: false // Disable logging, if preferred
});

module.exports = sequelize;
