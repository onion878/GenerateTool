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
        this.udb.defaults({defaultUrl: ''}).write();
        this.udb.defaults({afterShell: true, beforeShell: true}).write();
        this.udb.defaults({authCode: []}).write();
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

    setDefaultUrl(url) {
        this.udb.set('defaultUrl', url)
            .write();
    }

    getAuth() {
        return this.udb.get('auth').value();
    }

    setUrl(v) {
        let d = this.udb.get('defaultUrl').value();
        if (d != v) {
            this.udb.set('url', v)
                .write();
        }
    }

    getUrl() {
        let d = this.udb.get('url').value();
        if (help.isEmpty(d)) {
            d = this.udb.get('defaultUrl').value();
        }
        return d;
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

    setConfig(key, val) {
        this.udb.set(key, val)
            .write();
    }

    getConfig(key) {
        return this.udb.get(key).value();
    }

    setAuthCode(code) {
        var d = this.udb.get('authCode').value(), flag = false;
        d.forEach(l => {
            if (l == code) {
                flag = true;
            }
        });
        if (!flag) {
            d.push(code);
        }
        this.udb.set('authCode', d)
            .write();
    }

    getAuthCode() {
        return this.udb.get('authCode').value();
    }

    deleteAuthCode(code) {
        var list = this.udb.get('authCode').value();
        const rows = [];
        list.forEach(l => {
            if (l != code) {
                rows.push(l);
            }
        })
        this.udb.set('authCode', rows)
            .write();
    }
}

module.exports = new User();
