const fs = require('fs');
const request = require('request');
const shell = require('shelljs');
const child = require('child_process').execFile;
const marked = require('marked');

class Utils {

    isEmpty(val) {
        if (val !== undefined && val != null && (val + '').trim() !== '') return false; else return true;
    }

    notEmpty(val) {
        return !this.isEmpty(val);
    }

    clear(data) {
        for (const key in data) {
            data[key] = null;
        }
    }

    getStringDate(date) {
        const Y = date.getFullYear();
        const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        const D = date.getDate() + ' ';
        const selectDate = Y + '-' + M + (parseInt(D, 0) < 10 ? '0' + D : D) + '';
        return (selectDate);
    }

    getStringLongDate(date) {
        const Y = date.getFullYear();
        const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        const D = date.getDate() + ' ';
        const selectDate = Y + '-' + M + (parseInt(D, 0) < 10 ? '0' + D : D) + ' 00:00:00';
        return (selectDate);
    }

    getNow() {
        const date = new Date();
        const Y = date.getFullYear();
        const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        const D = date.getDate() + ' ';
        const selectDate = Y + '-' + M + (parseInt(D, 0) < 10 ? '0' + D : D) + '';
        return (selectDate);
    }

    getNowTime() {
        let date = new Date();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hours = date.getHours();
        let min = date.getMinutes();
        let sec = date.getSeconds();

        let code = date.getFullYear() + '-' + toForMatter(month) + '-' +
            toForMatter(day) + ' ' + toForMatter(hours) + ':' + toForMatter(min)
            + ':' + toForMatter(sec);

        function toForMatter(num) {
            if (num < 10) {
                num = "0" + num;
            }
            return num + "";
        }

        return code;
    }

    getNowYear() {
        const date = new Date();
        const Y = date.getFullYear() + '';
        return Y;
    }

    shuffle(arr) {
        let i = arr.length, t, j;
        while (i) {
            j = Math.floor(Math.random() * i--);
            t = arr[i];
            arr[i] = arr[j];
            arr[j] = t;
        }
        return arr;
    }

    getUUID() {
        let d = new Date().getTime();
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    }

    writeFile({path, content}) {
        try {
            fs.writeFileSync(path, content, 'utf8');
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    createFile(path, content) {
        try {
            path = path.replace(/\\/g, '/');
            const filePath = path.substring(0, path.lastIndexOf(`/`));
            if (!fs.existsSync(filePath)) {
                shell.mkdir('-p', filePath);
            }
            fs.writeFileSync(path, content, 'utf8');
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    readFile(path) {
        path = path.replace(/\\/g, '/');
        if (fs.existsSync(path)) {
            return fs.readFileSync(path, 'utf8');
        } else {
            return null;
        }
    }

    unLinkFile(path) {
        path = path.replace(/\\/g, '/');
        if (fs.existsSync(path)) {
            fs.unlinkSync(path);
        }
    }

    openCodeFolder(file, folder) {
        child(file, [folder], function (err, data) {
            if (err) {
                console.error(err);
                return;
            }
        });
    }

    fileExists(path) {
        return fs.existsSync(path);
    }

    getNowTimeCode() {
        let date = new Date();
        let month = (date.getMonth()) + 1;
        let day = date.getDate();
        let hours = date.getHours();
        let min = date.getMinutes();
        let sec = date.getSeconds();

        let code = date.getFullYear() + toForMatter(month) +
            toForMatter(day) + toForMatter(hours) + toForMatter(min)
            + toForMatter(sec);

        function toForMatter(num) {
            if (num < 10) {
                num = "0" + num;
            }
            return num + "";
        }

        return code;
    }

    uploadFile(file, name, data, auth) {
        return new Promise((resolve, reject) => {
            data['file'] = {
                value: fs.createReadStream(file),
                options: {
                    filename: name,
                    contentType: 'application/zip'
                }
            };
            const userConfig = require('../dao/user');
            const url = userConfig.getUrl() + '/upload';
            const options = {
                method: "POST",
                url: url,
                headers: {
                    "Authorization": "Bearer " + auth,
                    "Content-Type": "multipart/form-data"
                },
                formData: data
            };

            request(options, function (err, res, body) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                resolve(JSON.parse(body));
            });
        });
    }

    downloadFile(file, f) {
        return new Promise((resolve, reject) => {
            const url = userConfig.getUrl() + '/download/' + file;
            const r = request(url);
            const help = require('./help');
            const p = help.getDataPath();
            r.on('response', function (res) {
                if (res.statusCode == 200) {
                    const re = res.pipe(fs.createWriteStream(p + '/' + f));
                    re.on('finish', () => {
                        console.log('end');
                        resolve(p + f);
                    });
                    re.on('error', () => {
                        reject('文件失效!');
                    });
                } else {
                    reject('文件失效!');
                }
            });
        });
    }

    showUpdate() {
        return marked(this.readFile(require('app-root-path').path + '/UPDATE.md'));
    }

    getVersion() {
        return require(require('app-root-path').path + '/package.json').version;
    }

    showHelp(file) {
        return marked(this.readFile(require('app-root-path').path + '/help/' + file));
    }
}

module.exports = new Utils();
