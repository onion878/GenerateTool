const {app} = require('electron').remote;
const path = require('path');

module.exports = {
    getDataPath() {
        return path.join(process.env.ProgramData || 'C:/ProgramData', '/', app.getName(), '/').replace(/\\/g, '\/');
    },
    getPid() {
        const history = require('../dao/history');
        return history.getMode()
    }
};
