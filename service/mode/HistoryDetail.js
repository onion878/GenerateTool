const Sequelize = require('sequelize');
const sequelize = require('../utils/pool');
const Model = Sequelize.Model;

class HistoryDetail extends Model {
}

HistoryDetail.init({
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    content: Sequelize.TEXT,
    date: Sequelize.STRING,
    file: Sequelize.STRING,
    oldContent: Sequelize.TEXT,
    tempId: Sequelize.TEXT,
    type: Sequelize.STRING,
    flag: Sequelize.BOOLEAN,
    pId: Sequelize.INTEGER
}, {sequelize, modelName: 'history_detail'});
HistoryDetail.sync({ force: false });
module.exports = HistoryDetail;
