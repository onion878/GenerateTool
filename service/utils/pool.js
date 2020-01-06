const Sequelize = require('sequelize'), dataPath = require('./help').getDataPath();
const logger = require('./logger');
const sequelize = new Sequelize('database', 'username', 'password', {
    // sqlite! now!
    dialect: 'sqlite',
    max: 10,
    match: [
        'SQLITE_BUSY: database is locked!'
    ],
    // the storage engine for sqlite
    // - default ':memory:'
    storage: dataPath + '/data.db',
    logging: msg => logger.debug(msg),
});
sequelize.authenticate()
    .then(() => {
        logger.debug('Connection has been established successfully.');
    })
    .catch(err => {
        logger.debug('Unable to connect to the database:', err);
    });
module.exports = sequelize;
