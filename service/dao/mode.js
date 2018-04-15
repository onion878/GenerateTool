const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('data/mode.json');
const m = low(adapter);
const utils = require('../utils/utils');

class Mode {

    constructor() {
        m.defaults({ data: [] }).write();
    }

    setData(name) {
        const id = utils.getUUID();
        m.get('data')
            .push({id: id,text: name})
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
}

module.exports = new Mode();
