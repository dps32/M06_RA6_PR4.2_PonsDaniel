const { Sequelize } = require('sequelize');
const { logger } = require('./logger');

const sequelize = new Sequelize(
    process.env.MYSQL_TEST_DATABASE,
    process.env.MYSQL_TEST_USER,
    process.env.MYSQL_TEST_PASSWORD,
    {
        host: process.env.MYSQL_TEST_HOST,
        port: process.env.MYSQL_TEST_PORT,
        dialect: 'mysql',
        logging: msg => logger.debug(msg), 
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = { sequelize };