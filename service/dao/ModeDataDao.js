const modeData = require('../mode/ModeData');
const Sequelize = require('sequelize');

class ModeDataDao {

    getData(id) {
        return modeData
            .findOne({
                where: {id: id}
            });
    }

    create(data) {
        return new Promise((resolve, reject) => {
            modeData.create(data).then(r => resolve(r)).catch(e => reject(e));
        })
    }

    update(data) {
        return new Promise((resolve, reject) => {
            modeData.update(data, {
                where: {id: data.id}
            }).then(r => resolve(r)).catch(e => reject(e));
        })
    }

    getAll(params) {
        return new Promise((resolve, reject) => {
            modeData.findAll({
                where: params,
                order: [
                    ['id', 'DESC']
                ]
            }).then(r => resolve(r)).catch(e => reject(e));
        });
    }

    deleteById(id) {
        return new Promise((resolve, reject) => {
            modeData.destroy({
                where: {
                    id: id
                }
            }).then(r => resolve(r)).catch(e => reject(e));
        });
    }

    clearAll() {
        const Op = Sequelize.Op;
        return new Promise((resolve, reject) => {
            modeData.destroy({
                where: {
                    id: {
                        [Op.ne]: null
                    }
                }
            }).then(r => resolve(r)).catch(e => reject(e))
        });
    }

}

module.exports = new ModeDataDao();
