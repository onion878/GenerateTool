const path = require('path'), os = require('os'), variable = require("./variable"),need = require('require-uncached');

module.exports = {
    getDataPath() {
        const platform = process.platform;
        switch (platform) {
            case 'win32':
                return path.join(process.env.ProgramData || 'C:/ProgramData', '/', 'GenerateTool', '/').replace(/\\/g, '\/');
            case 'darwin':
                return path.join(os.homedir(), 'Library', 'Application Support') + '/GenerateTool/';
            case 'linux':
                return process.env['XDG_CONFIG_HOME'] || path.join(os.homedir()) + '/GenerateTool/';
            default:
                throw new Error('Platform not supported');
        }
    },
    getPid() {
        let old = variable.getCache("historyId");
        if (old) {
            return old;
        }
        return need('../dao/history').getMode();
    },
    toJSON(data) {
        const v = {};
        data.forEach(d => {
            v[d.id] = d;
        });
        return v;
    },
    isEmpty(val) {
        if (val !== undefined && val != null && (val + '').trim() !== '') return false; else return true;
    }
};
