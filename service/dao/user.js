const help = require('../utils/help');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(help.getDataPath() + 'data/user.json');

class User {
    constructor() {
        this.udb = low(adapter);
        this.udb.defaults({
            user: {
                Password: "",
                UserName: ""
            },
            auth: '',
            url: ''
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
}

module.exports = new User();
