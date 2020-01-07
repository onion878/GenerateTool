const Sequelize = require('sequelize');
const sequelize = require('../utils/pool');
const Model = Sequelize.Model;

class History extends Model {
}

History.init({
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: Sequelize.STRING,
    date: Sequelize.STRING,
    pId: Sequelize.STRING,
    success: Sequelize.BOOLEAN,
    errMsg: Sequelize.TEXT
}, {sequelize, modelName: 'history'});
History.sync({ force: false });
module.exports = History;
