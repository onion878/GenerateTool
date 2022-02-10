const help = require('./help');
const fs = require('fs');
const log4js = require('log4js');
const filePath = help.getDataPath() + 'log.log';
try {
    if (fs.statSync(filePath).size > 100000) {
        fs.writeFileSync(filePath, '');
    }
} catch (e) {

}
log4js.configure({
    appenders: {'|': {type: 'file', filename: filePath}, console: {type: 'console'}},
    categories: {default: {appenders: ['|', 'console'], level: 'debug'}}
});
const logger = log4js.getLogger('|');

module.exports = {
    debug(message, ...optionalParams) {
        if (optionalParams.length > 0) {
            logger.debug(message, optionalParams);
        } else {
            logger.debug(message);
        }
    },
    info(message, ...optionalParams) {
        if (optionalParams.length > 0) {
            logger.info(message, optionalParams);
        } else {
            logger.info(message);
        }
    },
    warn(message, ...optionalParams) {
        if (optionalParams.length > 0) {
            logger.warn(message, optionalParams);
        } else {
            logger.warn(message);
        }
    },
    error(message, ...optionalParams) {
        if (optionalParams.length > 0) {
            logger.error(message, optionalParams);
        } else {
            logger.error(message);
        }
    },
    readValue() {
        return fs.readFileSync(help.getDataPath() + 'log.log', 'utf8');
    },
    clear() {
        fs.writeFileSync(filePath, '');
    }
};
