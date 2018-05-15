const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('data/system.json');
const db = low(adapter);

class System {

    constructor() {
        db.defaults({ data: [] }).write();
        db.defaults({ code: [] }).write();
    }

    setCode(name, language) {
        db.get('data')
            .push({id: utils.getUUID(),pId: pId, text: name, leaf: true})
            .write();
    }

    getCode(pId) {
        return db.get('data').filter({pId: pId}).value();
    }
}

module.exports = new System();
