const help = require('../utils/help');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(help.getDataPath() + 'data/modeData.json');
const mdb = low(adapter);
const utils = require('../utils/utils');

class ModeData {

    constructor() {
        mdb.defaults({data: []}).write();
    }

    setData(name, pId) {
        mdb.get('data')
            .push({id: utils.getUUID(), pId: pId, text: name, leaf: true})
            .write();
    }

    getData(pId) {
        return mdb.get('data').filter({pId: pId}).value();
    }

    getAll() {
        return mdb.get('data').value();
    }

    getById(id) {
        return mdb.get('data').find({id: id, pId: help.getPid()}).value();
    }

    removeById(id) {
        mdb.get('data').remove({id: id, pId: help.getPid()}).write();
    }

    removeByPId(pId) {
        mdb.get('data').remove({pId: pId}).write();
    }

    addAllData({data}) {
        const oldData = mdb.get('data').value();
        const newData = oldData.concat(data);
        mdb.set('data', newData).write();
    }

    updateAll({data, pId}) {
        mdb.get('data')
            .remove({pId: pId})
            .write();
        mdb.set('data', mdb.get('data').value().concat(data))
            .write();
    }

    removeAll(pId) {
        mdb.get('data')
            .remove({pId: pId})
            .write();
    }
}

module.exports = new ModeData();
