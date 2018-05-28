const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('data/gefile.json');
const gdb = low(adapter);
const utils = require('../utils/utils');

class GeFile {

    constructor() {
        gdb.defaults({data: []}).write();
    }

    setDataEdit(pId, file, content) {
        const v = this.getOneData(pId, file);
        if (v != undefined) {
            gdb.get('data').find({pId: pId, file: file})
                .set('content', content)
                .write();
        } else {
            gdb.get('data')
                .push({pId: pId, file: file, content: content, preview: null})
                .write();
        }
    }

    setDataPreview(pId, file, preview) {
        const v = this.getOneData(pId, file);
        if (v != undefined) {
            gdb.get('data').find({pId: pId, file: file})
                .set('preview', preview)
                .write();
        } else {
            gdb.get('data')
                .push({pId: pId, file: file, content: null, preview: preview})
                .write();
        }
    }

    getOneData(pId, file) {
        return gdb.get('data').find({pId: pId, file: file}).value();
    }

}

module.exports = new GeFile();
