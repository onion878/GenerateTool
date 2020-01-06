const historyDetail = require('../mode/HistoryDetail');

class HistoryDetailDao {

    create(data) {
        return new Promise((resolve, reject) => {
            historyDetail.create(data).then(r => resolve(r)).catch(e => reject(e));
        })
    }

    findDetail(pId) {
        return new Promise((resolve, reject) => {
            historyDetail.findAll({
                where: {pId: pId}
            }).then(r => resolve(r)).catch(e => reject(e));
        });
    }
}

module.exports = new HistoryDetailDao();
