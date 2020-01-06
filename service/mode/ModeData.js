const Sequelize = require('sequelize');
const sequelize = require('../utils/pool');
const Model = Sequelize.Model;

class ModeData extends Model {
}

ModeData.init({
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    date: Sequelize.STRING,
    pId: Sequelize.STRING,
    modeId: Sequelize.STRING,
    content: Sequelize.JSON
}, {sequelize, modelName: 'mode_data'});
ModeData.sync({ force: false });
module.exports = ModeData;
