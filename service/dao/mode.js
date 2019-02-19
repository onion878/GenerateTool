const help = require('../utils/help');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(help.getDataPath() + 'data/mode.json');
const m = low(adapter);
const utils = require('../utils/utils');

class Mode {

    constructor() {
        m.defaults({data: []}).write();
    }

    setData(name) {
        const id = utils.getUUID();
        m.get('data')
            .push({id: id, text: name, date: utils.getNowTime()})
            .write();
        return id;
    }

    getData(name) {
        return m.get('data').filter({text: name}).value();
    }

    getById(id) {
        return m.get('data').find({id: id}).value();
    }

    getAll() {
        return m.get('data').value();
    }

    removeById(id) {
        m.get('data').remove({id: id}).write();
    }

    addAllData({data}) {
        const oldData = m.get('data').value();
        data.forEach(d => d.date = utils.getNowTime());
        const newData = oldData.concat(data);
        m.set('data', newData).write();
    }

    updateText({id, text}) {
        m.get('data')
            .find({
                id: id
            })
            .set('text', text)
            .write();
    }

    removeAll(pId) {
        m.get('data')
            .remove({id: pId})
            .write();
    }
}

module.exports = new Mode();
