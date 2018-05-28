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
        if(value == undefined || value == null) value = '';
        con.get('ext')
            .find({id: id})
            .set('data', value)
            .write();
    }

    setCode(id, val) {
        const d = con.get('code')
            .find({id: id})
            .value();
        if (d == undefined || d == null) {
            con.get('code')
                .push({id: id, value: val})
                .write();
        } else {
            con.get('code')
                .find({id: id})
                .set('value', val)
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

    //获取当前设置的控件数据集
    getModuleData(pId) {
        const data = con.get('ext').filter({pId: pId}).value();
        let json = {};
        data.forEach(function (d) {
            json[d.label] = d.data;
        });
        return json;
    }
}

module.exports = new Controls();
