const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('data/system.json');
const db = low(adapter);

class System {

    getData() {
        db.set('user.name', 'typicode')
            .write();
        const d = db.get('user').write().name;
    }
}

module.exports = new System();
