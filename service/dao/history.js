const help = require('../utils/help');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(help.getDataPath() + 'data/history.json');
const m = low(adapter);

class History {

    constructor() {
        m.defaults({mode: ''}).write();
        m.defaults({tab: []}).write();
        m.defaults({tabshow: ''}).write();
        m.defaults({codeshow: ''}).write();
        m.defaults({code: []}).write();
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

    setCode(data) {
        const d = m.get('code')
            .find({ id: data.id })
            .value();
        if(d == undefined || d == null) {
            m.get('code')
                .push(data)
                .write();
        } else {
            m.get('code').find({ id: data.id }).set('fileContent', data.fileContent).write();
        }
    }

    getCode() {
        return m.get('code').value();
    }

    getShowCodeTab() {
        return m.get('codeshow').value();
    }

    setShowCodeTab(id) {
        m.set('codeshow', id).write();
    }

    removeCodeTab(id) {
        m.get('code')
            .remove({id: id})
            .write();
        return this.getTab();
    }

    removeAll() {
        m.set('tab', []).write();
        m.set('tabshow', '').write();
        m.set('codeshow', '').write();
        m.set('code', []).write();
    }
}

module.exports = new History();
