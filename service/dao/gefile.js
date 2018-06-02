const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('data/gefile.json');
const gdb = low(adapter);
const utils = require('../utils/utils');

class GeFile {

    constructor() {
        gdb.defaults({data: []}).write();
    }

    setDataEdit(pId, file, folder, content) {
        const v = this.getOneData(pId, file);
        if (v != undefined) {
            gdb.get('data').find({pId: pId, file: file})
                .set('content', content)
                .write();
        } else {
            gdb.get('data')
                .push({pId: pId, file: file, content: content, preview: null, folder: folder})
                .write();
        }
    }

    setDataPreview(pId, file, folder, preview) {
        const v = this.getOneData(pId, file);
        if (v != undefined) {
            gdb.get('data').find({pId: pId, file: file})
                .set('preview', preview)
                .write();
        } else {
            gdb.get('data')
                .push({pId: pId, file: file, content: null, preview: preview, folder: folder})
                .write();
        }
    }

    getOneData(pId, file) {
        return gdb.get('data').find({pId: pId, file: file}).value();
    }

    removeData(pId, folder) {
        gdb.get('data')
            .remove({pId: pId, folder: folder})
            .write();
    }

    updateData(pId, folder, newFolder, newFile) {
        gdb.get('data')
            .find({pId: pId, folder: folder})
            .set('folder', newFolder)
            .set('file', newFolder + '\\' + newFile)
            .write();
    }
}

module.exports = new GeFile();
