const need = require('require-uncached');
const controlData = require('../service/dao/controls');
const jsC = require('../service/utils/JscodeUtil');
const history = require('../service/dao/history');
const moduleId = history.getMode();
const remote = require('electron').remote;
process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
        remote.getCurrentWindow().getParentWindow().send('runNodeErr', reason);
    })
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
        remote.getCurrentWindow().getParentWindow().send('runNodeErr', err.message);
        process.exit(1);
    });

//获取已经定义的数据
let getAllData = () => {
    return controlData.getModuleData(moduleId);
};

//创建无缓存node模块
let req = (module) => {
    return need(`${jsC.getFolder(moduleId)}/${module}`);
};

(function () {
    const _log = console.log;
    const _error = console.error;
    const _warning = console.warning;

    console.error = function (errMessage) {
        remote.getCurrentWindow().getParentWindow().send('runNode', errMessage.message);
        _error.apply(console, arguments);
    };

    console.log = function (logMessage) {
        remote.getCurrentWindow().getParentWindow().send('runNode', logMessage);
        // Do something with the log message
        _log.apply(console, arguments);
    };

    console.warning = function (warnMessage) {
        remote.getCurrentWindow().getParentWindow().send('runNode', warnMessage);
        // do something with the warn message
        _warning.apply(console, arguments);
    };

})();

