const history = require('../mode/History');
const historyDetail = require('../mode/HistoryDetail');
const Sequelize = require('sequelize');

class HistoryDao {

    getData(id) {
        return history
            .findOne({
                where: {id: id}
            });
    }

    setConfig(id, val) {
        return new Promise((resolve, reject) => {
            history.findOne({where: {id: id}}).then(project => {
                if (project == null) {
                    history.create({id: id, data: val}).then(r => resolve(r)).catch(e => reject(e));
                } else {
                    history.update({data: val}, {
                        where: {id: id}
                    }).then(r => resolve(r)).catch(e => reject(e));
                }
            })
        })
    }

    create(data) {
        return new Promise((resolve, reject) => {
            history.create(data).then(r => resolve(r)).catch(e => reject(e));
        })
    }

    update(data) {
        return new Promise((resolve, reject) => {
            history.update(data, {
                where: {id: data.id}
            }).then(r => resolve(r)).catch(e => reject(e));
        })
    }

    getAll(params) {
        return new Promise((resolve, reject) => {
            history.findAll({
                where: params,
                order: [
                    ['id', 'DESC']
                ]
            }).then(r => resolve(r)).catch(e => reject(e));
        });
    }

    deleteById(id) {
        return new Promise((resolve, reject) => {
            historyDetail.destroy({
                where: {
                    pId: id
                }
            }).then(() => {
                history.destroy({
                    where: {
                        id: id
                    }
                }).then(r => resolve(r)).catch(e => reject(e));
            }).catch(e => reject(e))
        });
    }

    clearAll() {
        const Op = Sequelize.Op;
        return new Promise((resolve, reject) => {
            historyDetail.destroy({
                where: {
                    id: {
                        [Op.ne]: null
                    }
                }
            }).then(() => {
                history.destroy({
                    where: {
                        id: {
                            [Op.ne]: null
                        }
                    }
                }).then(r => resolve(r)).catch(e => reject(e));
            }).catch(e => reject(e))
        });
    }

}

module.exports = new HistoryDao();
