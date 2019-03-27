const help = require('../utils/help');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

class User {

    constructor() {
        this.udb = low(new FileSync(help.getDataPath() + 'data/user.json'));
        this.udb.defaults({
            user: {
                Password: "",
                UserName: ""
            },
            auth: '',
            url: '',
            background: '',
            opacity: 1
        }).write();
    }

    setUser(user) {
        this.udb.set('user', user)
            .write();
    }

    getUser() {
        return this.udb.get('user').value();
    }

    setAuth(token) {
        this.udb.set('auth', token)
            .write();
    }

    getAuth() {
        return this.udb.get('auth').value();
    }

    setUrl(v) {
        this.udb.set('url', v)
            .write();
    }

    getUrl() {
        return this.udb.get('url').value();
    }

    setBg(v) {
        this.udb.set('background', v)
            .write();
    }

    getBg() {
        return this.udb.get('background').value();
    }

    setOpacity(v) {
        this.udb.set('opacity', v)
            .write();
    }

    getOpacity() {
        return this.udb.get('opacity').value();
    }
}

module.exports = new User();
