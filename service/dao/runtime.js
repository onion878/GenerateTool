const help = require('../utils/help');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(help.getDataPath() + 'data/runtime.json');
const mdb = low(adapter);
const utils = require('../utils/utils');

class RuntimeDao {

    constructor() {
        mdb.defaults({data: []}).write();
    }

    setData(time, id) {
        const old = this.getData(id);
        if (old.length >= 10) {
            mdb.get('data')
                .remove({id: id, key: old[0].key})
                .write();
        }
        mdb.get('data')
            .push({key: utils.getUUID(), id: id, time: time, sort: new Date().getTime()})
            .write();
    }

    getData(id) {
        return mdb.get('data').filter({id: id}).value();
    }

    getById(id) {
        const list = mdb.get('data').filter({id: id}).value();
        let total = 0;
        list.forEach(r => {
            total = total + r.time;
        });
        if (list.length > 0)
            return Math.round(total / list.length);
        else
            return 1000 * 60 * 5;
    }

}

module.exports = new RuntimeDao();
