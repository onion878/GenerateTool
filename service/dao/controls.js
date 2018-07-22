const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('data/controls.json');
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
    }

    removeExt(id) {
        con.get('ext')
            .remove({id: id})
            .write();
    }

    setExtLabel(id, label) {
        con.get('ext')
            .find({id: id})
            .set('label', label)
            .write();
    }

    getExt(id) {
        return con.get('ext').filter({cId: id}).value();
    }

    setDataValue(id, value) {
        if (value == undefined || value == null) value = '';
        con.get('ext')
            .find({id: id})
            .set('data', value)
            .write();
    }

    setCode(id, val, cId) {
        const d = con.get('code')
            .find({id: id})
            .value();
        if (d == undefined || d == null) {
            con.get('code')
                .push({id: id, value: val, cId: cId})
                .write();
        } else {
            con.get('code')
                .find({id: id})
                .set('value', val)
                .set('cId', cId)
                .write();
        }
    }

    removeCode(id) {
        con.get('code')
            .remove({id: id})
            .write();
    }

    getCode(id) {
        return con.get('code').find({id: id}).value();
    }

    getAllCode(cId) {
        return con.get('code').filter({cId: cId}).value();
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
        data.forEach(v=> {
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
        return con.get('code').find({id: id}).value();
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

    removeAll(pId) {
        const oldExt = con.get('ext').filter({pId: pId}).value();
        oldExt.forEach( e => {
            con.get('code')
                .remove({ id: e.id })
                .write();
        });
        con.get('ext')
            .remove({ pId: pId })
            .write();
    }
}

module.exports = new Controls();
