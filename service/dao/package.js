const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('data/package.json');
const db = low(adapter);
const utils = require('../utils/utils');

class Package {

    constructor() {
        db.defaults({data: []}).write();
    }

    getAll(pId) {
        return db.get('data').filter({pId: pId}).value();
    }

    add(data) {
        const val = db.get('data').filter({name: data.name}).value();
        if (val.length == 0) {
            data.id = utils.getUUID();
            db.get('data')
                .push(data)
                .write();
        } else {
            data.id = val[0].id;
            db.get('data')
                .remove({id: data.id})
                .write();
            db.get('data')
                .push(data)
                .write();
        }
    }

    remove(name) {
        db.get('data')
            .remove({name: name})
            .write();
    }

    addAllData({data}) {
        const oldData = db.get('data').value();
        const newData = oldData.concat(data);
        db.set('data', newData).write();
    }

    removeAll(pId) {
        db.get('data')
            .remove({ pId: pId })
            .write();
    }
}

module.exports = new Package();
