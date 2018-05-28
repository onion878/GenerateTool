const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('data/history.json');
const m = low(adapter);

class History {

    constructor() {
        m.defaults({mode: ''}).write();
        m.defaults({tab: []}).write();
        m.defaults({tabshow: ''}).write();
    }

    setMode(name) {
        m.set('mode', name).write();
    }

    getMode() {
        return m.get('mode').value();
    }

    setTab(data) {
        const d = m.get('tab')
            .find({ id: data.id })
            .value();
        if(d == undefined || d == null) {
            m.get('tab')
                .push(data)
                .write();
        }
    }

    getTab() {
        return m.get('tab').value();
    }

    removeTab(id) {
        m.get('tab')
            .remove({id: id})
            .write();
        return this.getTab();
    }

    getShowTab() {
        return m.get('tabshow').value();
    }

    setShowTab(id) {
        m.set('tabshow', id).write();
    }
}

module.exports = new History();
