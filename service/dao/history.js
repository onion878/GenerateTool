const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('data/history.json');
const m = low(adapter);

class History {

    constructor() {
        m.defaults({ mode: '' }).write();
    }

    setMode(name) {
        m.set('mode', name).write();
        return id;
    }

    getMode() {
        return m.get('mode').value();
    }

}

module.exports = new History();
