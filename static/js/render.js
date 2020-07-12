const swig = require('swig');
const need = require('require-uncached');
const appPath = require('app-root-path').path.replace(/\\/g, '/');
let controlData = need(appPath + '/service/dao/controls');
const jsC = require('../service/utils/JscodeUtil');
const logger = require('../service/utils/logger');
const utils = require('../service/utils/utils');
let history = need(appPath + '/service/dao/history');
let moduleId = history.getMode();
const remote = require('electron').remote;
let geFileData = need(appPath + '/service/dao/gefile');
const fileData = need(appPath + '/service/dao/file');
process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
        remote.getCurrentWindow().getParentWindow().send('runNodeErr', reason);
    })
    .on('uncaughtException', err => {
        console.error(err);
        remote.getCurrentWindow().getParentWindow().send('runNodeErr', err.message);
    });
try {
    eval(geFileData.getSwig(moduleId));
} catch (e) {
    console.error(e);
}
//获取已经定义的数据
const getAllData = () => {
    controlData = need(appPath + '/service/dao/controls');
    return controlData.getModuleData(moduleId);
};

//获取所有生成文件
const getAllFile = () => {
    controlData = need(appPath + '/service/dao/controls');
    const files = [],
        generatorData = geFileData.getFileData(moduleId);
    const allModuleData = controlData.getModuleData(moduleId);
    generatorData.forEach(f => {
        if (!utils.isEmpty(f.file) && !utils.isEmpty(f.content)) {
            const {updateType} = fileData.getFile(f.id);
            f.file = f.file.replace(/\\/g, '\/');
            const tpl = swig.compile(f.file);
            f.name = tpl(allModuleData).replace(/\\/g, '\/');
            const flag = utils.fileExists(f.name);
            if (flag) {
                f.flag = '是';
            } else {
                f.flag = '否';
            }
            f.type = updateType;
            files.push({file: f.name, type: updateType, exits: f.flag});
        }
    });
    return files;
};

//创建无缓存node模块
const req = (module) => {
    return need(`${jsC.getFolder(moduleId)}/${module}`);
};

const compileTemplate = (fileId) => {
    return new Promise((resolve, reject) => {
        try {
            geFileData = need(appPath + '/service/dao/gefile');
            controlData = need(appPath + '/service/dao/controls');
            const tpl = swig.compile(geFileData.getOneData(fileId).content);
            resolve(tpl(controlData.getModuleData(moduleId)));
        } catch (e) {
            reject(e);
        }
    });
};

(function () {
    const _log = console.log;
    const _error = console.error;
    const _warning = console.warning;
    const _debug = console.debug;

    console.debug = function (msg) {
        logger.debug(msg);
        remote.getCurrentWindow().getParentWindow().send('runNode', msg.message);
        _debug.apply(console, arguments);
    };

    console.error = function (errMessage) {
        logger.error(errMessage);
        remote.getCurrentWindow().getParentWindow().send('runNode', errMessage.message);
        _error.apply(console, arguments);
    };

    console.log = function (logMessage) {
        logger.info(logMessage);
        remote.getCurrentWindow().getParentWindow().send('runNode', logMessage);
        // Do something with the log message
        _log.apply(console, arguments);
    };

    console.warning = function (warnMessage) {
        logger.warning(warnMessage);
        remote.getCurrentWindow().getParentWindow().send('runNode', warnMessage);
        // do something with the warn message
        _warning.apply(console, arguments);
    };
})();
