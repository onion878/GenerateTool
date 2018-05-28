const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('data/file.json');
const fdb = low(adapter);
const utils = require('../utils/utils');

class File {

    constructor() {
        fdb.defaults({data: []}).write();
    }

    addFile(pId, folder, files, code, id) {
        if (id != undefined)
            this.removeFile(id);
        fdb.get('data')
            .push({id: utils.getUUID(), pId: pId, folder: folder, files: files, code: code})
            .write();
    }

    removeFile(id) {
        fdb.get('data')
            .remove({id: id})
            .write();
    }

    getFiles(pId) {
        return fdb.get('data').filter({pId: pId}).value();
    }

    getFile(id) {
        return fdb.get('data').find({id: id}).value();
    }
}

module.exports = new File();
