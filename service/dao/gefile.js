const help = require('../utils/help');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(help.getDataPath() + 'data/gefile.json');
const gdb = low(adapter);

class GeFile {

    constructor() {
        gdb.defaults({
            data: [],
            swig: [],
            shell: [],
            beforeShell: []
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

    setDataEdit(id, pId, content) {
        const v = this.getOneData(id);
        console.log(v);
        if (v != undefined) {
            gdb.get('data').find({
                id: id, pId: help.getPid()
            })
                .set('content', content)
                .write();
        } else {
            gdb.get('data')
                .push({
                    id: id,
                    pId: pId,
                    file: '',
                    content: content,
                    preview: null
                })
                .write();
        }
    }

    setDataPreview(id, pId, preview) {
        const v = this.getOneData(id);
        if (v != undefined) {
            gdb.get('data').find({
                id: id, pId: help.getPid()
            }).set('preview', preview)
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
            id: id, pId: help.getPid()
        }).value();
    }

    removeData(id) {
        gdb.get('data')
            .remove({
                id: id, pId: help.getPid()
            })
            .write();
    }

    updateDataFile(id, file) {
        gdb.get('data')
            .find({
                id: id, pId: help.getPid()
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

    getFileSwig(pId) {
        return gdb.get('swig')
            .filter({
                pId: pId
            }).value();
    }

    getFileShell(pId) {
        return gdb.get('shell')
            .filter({
                pId: pId
            }).value();
    }

    getFilBeforeShell(pId) {
        return gdb.get('beforeShell')
            .filter({
                pId: pId
            }).value();
    }

    addAllData({data, swig, shell, beforeShell}) {
        const oldData = gdb.get('data').value();
        const newData = oldData.concat(data);
        gdb.set('data', newData).write();
        try {
            swig.forEach(s => {
                gdb.get('swig').push(s).write();
            });
        } catch (e) {
        }
        try {
            shell.forEach(s => {
                gdb.get('shell').push(s).write();
            });
        } catch (e) {
        }
        try {
            beforeShell.forEach(s => {
                gdb.get('beforeShell').push(s).write();
            });
        } catch (e) {
        }
    }

    updateAll({data, swig, shell, beforeShell, pId}) {
        gdb.get('data')
            .remove({pId: pId})
            .write();
        gdb.set('data', gdb.get('data').value().concat(data))
            .write();


        gdb.get('swig')
            .remove({pId: pId})
            .write();
        gdb.set('swig', gdb.get('swig').value().concat(swig))
            .write();

        gdb.get('shell')
            .remove({pId: pId})
            .write();
        gdb.set('shell', gdb.get('shell').value().concat(shell))
            .write();

        gdb.get('beforeShell')
            .remove({pId: pId})
            .write();
        gdb.set('beforeShell', gdb.get('beforeShell').value().concat(beforeShell))
            .write();
    }

    removeAll(pId) {
        gdb.get('data')
            .remove({pId: pId})
            .write();
        gdb.get('swig')
            .remove({pId: pId})
            .write();
        gdb.get('shell')
            .remove({pId: pId})
            .write();
        gdb.get('beforeShell')
            .remove({pId: pId})
            .write();
    }

    getSwig(pId) {
        let v = gdb.get('swig').find({pId: pId}).value();
        if (v != undefined) {
            v = v.content;
        } else {
            v = '';
        }
        return v;
    }

    setSwig(pId, content) {
        gdb.get('swig')
            .remove({
                pId: pId
            })
            .write();
        gdb.get('swig').push({pId: pId, content: content}).write();
    }

    getShell(pId) {
        let v = gdb.get('shell').find({pId: pId}).value();
        if (v != undefined) {
            v = v.content;
        } else {
            v = '';
        }
        if (v == null || v.trim().length == 0) {
            v = "const {execSync} = require('child_process');\r\n// 获取定义的data\r\nconst data = getAllData();";
        }
        return v;
    }

    getBeforeShell(pId) {
        let v = gdb.get('beforeShell').find({pId: pId}).value();
        if (v != undefined) {
            v = v.content;
        } else {
            v = '';
        }
        if (v == null || v.trim().length == 0) {
            v = "const {execSync} = require('child_process');\r\n// 获取定义的data\r\nconst data = getAllData();";
        }
        return v;
    }

    setShell(pId, content) {
        gdb.get('shell')
            .remove({
                pId: pId
            })
            .write();
        gdb.get('shell').push({pId: pId, content: content}).write();
    }

    setBeforeShell(pId, content) {
        gdb.get('beforeShell')
            .remove({
                pId: pId
            })
            .write();
        gdb.get('beforeShell').push({pId: pId, content: content}).write();
    }
}

module.exports = new GeFile();
