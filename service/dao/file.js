const help = require('../utils/help');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(help.getDataPath() + 'data/file.json');
const fdb = low(adapter);
const utils = require('../utils/utils');

class File {

    constructor() {
        fdb.defaults({
            data: []
        }).write();
    }

    saveOrUpdate(data, id) {
        if (id != undefined) this.removeFile(id);
        else id = utils.getUUID();
        data.id = id;
        fdb.get('data')
            .push(data)
            .write();
        return data;
    }

    removeFile(id) {
        fdb.get('data')
            .remove({
                id: id, pId: help.getPid()
            })
            .write();
    }

    getFiles(pId, rootId) {
        return fdb.get('data').filter({
            pId: pId
        }).filter({
            rootId: rootId
        }).value();
    }

    getFile(id) {
        return fdb.get('data').find({
            id: id, pId: help.getPid()
        }).value();
    }

    getTreeData(rootId, pId) {
        const list = [];
        this.getMoreData(rootId, pId, list);
        return list;
    }

    getMoreData(rootId, pId, list) {
        const data = fdb.get('data').filter({rootId: rootId, pId: pId}).value();
        data.forEach(d => {
            list.push(d);
            this.getMoreData(d.id, pId, list);
        });
    }

    updateRootId(id, rootId) {
        fdb.get('data').find({
            id: id, pId: help.getPid()
        }).set('rootId', rootId)
            .write()
    }

    updateName(id, name) {
        fdb.get('data').find({
            id: id, pId: help.getPid()
        }).set('text', name)
            .write()
    }

    getExportData(id) {
        return fdb.get('data').filter({pId: id}).value();
    }

    addAllData({data}) {
        const oldData = fdb.get('data').value();
        const newData = oldData.concat(data);
        fdb.set('data', newData).write();
    }

    removeAll(pId) {
        fdb.get('data')
            .remove({ pId: pId })
            .write();
    }
}

module.exports = new File();
