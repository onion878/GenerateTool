const help = require('../utils/help');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const utils = require('../utils/utils');

class Operation {

    constructor() {
        this.db = low(new FileSync(help.getDataPath() + 'data/operation.json'));
        this.db.defaults({
            data: [],
            details: []
        }).write();
    }

    setOperation(d, detail) {
        if (utils.isEmpty(d.id)) {
            d.id = utils.getUUID();
            this.db.get('data')
                .push(d)
                .write();
        }
        detail.pId = d.id;
        this.db.get('details')
            .push(detail)
            .write();
        return d.id;
    }

    getAll() {
        return this.db.get('data').value();
    }

    find(pId) {
        return this.db.get('data').filter({pId: pId}).value();
    }

    findDetail(pId) {
        const rows = this.db.get('details').filter({pId: pId}).value();
        rows.map(r => {
            if (r.oldContent !== null)
                r.oldHtml = r.oldContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            else
                r.oldHtml = null
        });
        return rows;
    }

    deleteById(id) {
        this.db.get('data').remove({id: id})
            .write();
        this.db.get('details').remove({pId: id})
            .write();
    }
}

module.exports = new Operation();
