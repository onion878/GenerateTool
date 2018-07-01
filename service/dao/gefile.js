const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('data/gefile.json');
const gdb = low(adapter);
const utils = require('../utils/utils');

class GeFile {

    constructor() {
        gdb.defaults({
            data: []
        }).write();
    }

    save(id, pId) {
        gdb.get('data')
                .push({
                    id: id,
                    pId: pId,
                    file: '',
                    content: null,
                    preview: null
                })
                .write();
    }

    setDataEdit(id, pId, content, preview) {
        const v = this.getOneData(id);
        if (v != undefined) {
            gdb.get('data').find({
                    id: id
                })
                .set('content', content)
                .set('preview', preview)
                .write();
        } else {
            gdb.get('data')
                .push({
                    id: id,
                    pId: pId,
                    file: '',
                    content: content,
                    preview: preview
                })
                .write();
        }
    }

    setDataPreview(id, pId, preview) {
        const v = this.getOneData(id);
        if (v != undefined) {
            gdb.get('data').find({
                    id: id
                })
                .set('preview', preview)
                .write();
        } else {
            gdb.get('data')
                .push({
                    id: id,
                    pId: pId,
                    file: '',
                    content: null,
                    preview: preview
                })
                .write();
        }
    }

    getOneData(id) {
        return gdb.get('data').find({
            id: id
        }).value();
    }

    removeData(id) {
        gdb.get('data')
            .remove({
                id: id
            })
            .write();
    }

    updateDataFile(id, file) {
        gdb.get('data')
            .find({
                id: id
            })
            .set('file', file)
            .write();
    }

    getFileData(pId) {
        return gdb.get('data')
            .filter({
                pId: pId
            }).value();
    }
}

module.exports = new GeFile();