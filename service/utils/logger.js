const help = require('./help');
const fs = require('fs');
const log4js = require('log4js');
const filePath = help.getDataPath() + 'log.log';
if (fs.statSync(filePath).size > 50000) {
    fs.writeFileSync(filePath, '');
}
log4js.configure({
    appenders: {cheese: {type: 'file', filename: filePath}, console: {type: 'console'}},
    categories: {default: {appenders: ['cheese', 'console'], level: 'debug'}}
});
const logger = log4js.getLogger('cheese');
module.exports = {
    debug(message, ...optionalParams) {
        logger.debug(message, optionalParams);
    },
    info(message, ...optionalParams) {
        logger.info(message, optionalParams);
    },
    warn(message, ...optionalParams) {
        logger.warn(message, optionalParams);
    },
    error(message, ...optionalParams) {
        logger.error(message, optionalParams);
    },
    readValue() {
        return fs.readFileSync(help.getDataPath() + 'log.log', 'utf8');
    }
};
