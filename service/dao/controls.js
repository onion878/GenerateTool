const help = require('../utils/help');
const low = require('lowdb');
const fs = require('fs');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(help.getDataPath() + 'data/controls.json');
const con = low(adapter);

class Controls {

    constructor() {
        con.defaults({ext: []}).write();
        con.defaults({code: []}).write();
    }

    setExt(data) {
        data.data = '';
        con.get('ext')
            .push(data)
            .write();
        this.changeData();
    }

    removeExt(id) {
        con.get('ext')
            .remove({id: id, pId: help.getPid()})
            .write();
        this.changeData();
    }

    setExtLabel(id, label) {
        con.get('ext')
            .find({id: id, pId: help.getPid()})
            .set('label', label)
            .write();
        this.changeData();
    }

    getExt(id) {
        return con.get('ext').filter({cId: id, pId: help.getPid()}).value();
    }

    getExtById(id) {
        return con.get('ext').filter({id: id, pId: help.getPid()}).value();
    }

    setDataValue(id, value) {
        if (value == undefined || value == null) value = '';
        con.get('ext')
            .find({id: id, pId: help.getPid()})
            .set('data', value)
            .write();
        this.changeData();
    }

    setCode(id, val, cId) {
        const d = con.get('code')
            .find({id: id, pId: help.getPid()})
            .value();
        if (d == undefined || d == null) {
            con.get('code')
                .push({id: id, value: val, cId: cId, pId: help.getPid()})
                .write();
        } else {
            con.get('code')
                .find({id: id, pId: help.getPid()})
                .set('value', val)
                .set('cId', cId)
                .set('pId', help.getPid())
                .write();
        }
        this.changeData();
    }

    removeCode(id) {
        con.get('code')
            .remove({id: id, pId: help.getPid()})
            .write();
        this.changeData();
    }

    getCode(id) {
        return con.get('code').find({id: id, pId: help.getPid()}).value();
    }

    getAllCode(cId) {
        return con.get('code').filter({cId: cId, pId: help.getPid()}).value();
    }

    //获取当前设置的控件数据集
    getModuleData(pId) {
        const data = con.get('ext').filter({pId: pId}).value();
        let json = {};
        data.forEach(function (d) {
            json[d.label] = d.data;
        });
        return json;
    }

    sortExt(data, cId, pId) {
        con.get('ext')
            .remove({pId: pId, cId: cId})
            .write();
        data.forEach(v => {
            con.get('ext')
                .push(v)
                .write();
        });
        return data;
    }

    getExtByPid(id) {
        return con.get('ext').filter({pId: id}).value();
    }

    getCodeById(id) {
        return con.get('code').find({id: id, pId: help.getPid()}).value();
    }

    getCodeByPid(pId) {
        return con.get('code').filter({pId: pId}).value();
    }

    addAllData({ext, code}) {
        const oldExt = con.get('ext').value();
        const oldCode = con.get('code').value();
        const newExt = oldExt.concat(ext);
        const newCode = oldCode.concat(code);
        con.set('ext', newExt)
            .set('code', newCode)
            .write();
    }

    updateAll({ext, code, pId}) {
        const oldExt = con.get('ext').filter({pId: pId}).value();
        const newExt = help.toJSON(oldExt);
        ext.forEach((o, i) => {
            const d = newExt[o.id];
            if (d) {
                ext[i].data = d.data;
            }
        });

        con.get('ext')
            .remove({pId: pId})
            .write();
        con.get('code')
            .remove({pId: pId})
            .write();

        con.set('ext', con.get('ext').value().concat(ext))
            .set('code', con.get('code').value().concat(code))
            .write();
    }

    removeAll(pId) {
        con.get('code')
            .remove({pId: pId})
            .write();
        con.get('ext')
            .remove({pId: pId})
            .write();
        this.changeData();
    }

    changeData() {
        const pId = help.getPid();
        const path = help.getDataPath() + 'jscode/' + pId;
        fs.writeFileSync(path + '/data.js', 'let data=' + JSON.stringify(this.getModuleData(pId)) + ';try {data = getAllData();}catch (e) {}module.exports = data;', 'utf8');
    }
}

module.exports = new Controls();
