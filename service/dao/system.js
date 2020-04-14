const help = require('../utils/help');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

class System {

    constructor() {
        this.sdb = low(new FileSync(help.getDataPath() + 'data/system.json'));
        this.sdb.defaults({
            data: [],
            code: {},
            zoom: 1,
            theme: 'neptune',
            user: {},
            auth: '',
            terminal: '',
            editor: '',
            win: {},
            version: ''
        }).write();
    }

    setCode(name, language) {
        const index = name.lastIndexOf(".");
        name = name.substr(index + 1);
        this.sdb.set('code.' + name, language)
            .write();
    }

    getCode(name) {
        const index = name.lastIndexOf(".");
        name = name.substr(index + 1);
        return this.sdb.get('code.' + name).value();
    }

    removeCode(name) {
        return this.sdb.unset('code.' + name).write();
    }

    updateCode(name, language) {
        return this.sdb.set('code.' + name, language).write();
    }

    findCode(name) {
        return this.sdb.get('code.' + name).value();
    }

    getAllCode() {
        return this.sdb.get('code').value();
    }

    setZoom(val) {
        this.sdb.set('zoom', val).write();
    }

    getZoom() {
        return this.sdb.get('zoom').value();
    }

    setTheme(name) {
        this.sdb.set('theme', name).write();
    }

    getTheme() {
        return this.sdb.get('theme').value();
    }

    setUser(username, password) {
        this.sdb.set('user', {username: username, password: password})
            .write();
    }

    getUser() {
        return this.sdb.get('user').value();
    }

    setAuth(token) {
        this.sdb.set('auth', token)
            .write();
    }

    getAuth() {
        return this.sdb.get('auth').value();
    }

    setConfig(id, value) {
        this.sdb.set(id, value)
            .write();
    }

    getConfig(id) {
        return this.sdb.get(id).value();
    }

    setWin(config) {
        this.sdb.set('win', config)
            .write();
    }

    getWin() {
        return this.sdb.get('win').value();
    }
}

module.exports = new System();
