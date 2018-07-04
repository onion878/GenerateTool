const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('data/system.json');
const sdb = low(adapter);

class System {

    constructor() {
        sdb.defaults({data: []}).write();
        sdb.defaults({code: {}}).write();
        sdb.defaults({zoom: 1}).write();
        sdb.defaults({theme: 'neptune'}).write();
    }

    setCode(name, language) {
        const index = name.lastIndexOf(".");
        name = name.substr(index + 1);
        sdb.set('code.' + name, language)
            .write();
    }

    getCode(name) {
        const index = name.lastIndexOf(".");
        name = name.substr(index + 1);
        return sdb.get('code.' + name).value();
    }

    setZoom(val) {
        sdb.set('zoom', val).write();
    }

    getZoom() {
        return sdb.get('zoom').value();
    }

    setTheme(name) {
        sdb.set('theme', name).write();
    }

    getTheme() {
        return sdb.get('theme').value();
    }
}

module.exports = new System();
