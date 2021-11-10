const fs = require('fs');
const request = require('request');
const shell = require('shelljs');
const child = require('child_process').execFile;
const childSync = require('child_process').execFileSync;
const marked = require('marked');
const xlsx = require('node-xlsx');

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
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
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

    createFolder(folder) {
        try {
            if (!fs.existsSync(folder)) {
                shell.mkdir('-p', folder);
            }
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    createFile(file, content) {
        const path = require('path');
        try {
            const filePath = path.dirname(file);
            if (!fs.existsSync(filePath)) {
                shell.mkdir('-p', filePath);
            }
            fs.writeFileSync(file, content, 'utf8');
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

            }
        });
    }

    runFile(file, args) {
        return childSync(file, args, {shell: true});
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
        const that = this;
        return new Promise((resolve, reject) => {
            const total = fs.lstatSync(file).size;
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
            let q;
            Ext.getCmp('msg-bar').setProgress(`上传中(${'0 KB to ' + that.formatSizeUnits(total)})...`, 0);
            const r = request(options, function (err, res, body) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                clearInterval(q);
                Ext.getCmp('msg-bar').closeProgress();
                resolve(JSON.parse(body));
            });
            q = setInterval(function () {
                let dispatched = r.req.connection._bytesDispatched;
                const progressVal = dispatched / total;
                Ext.getCmp('msg-bar').setProgress(`上传中(${that.formatSizeUnits(dispatched) + ' to ' + that.formatSizeUnits(total)})...`, progressVal);
            }, 250);
        });
    }

    downloadFile(file, f, url, progressBar) {
        const that = this;
        return new Promise((resolve, reject) => {
            if (url === undefined) {
                const userConfig = require('../dao/user');
                url = userConfig.getUrl() + '/download/' + file;
            }
            const r = request(url);
            const help = require('./help');
            const p = help.getDataPath();
            let received = 0;
            let total = 0;
            r.on('response', function (res) {
                total = parseInt(res.headers['content-length']);
                if (fs.existsSync(p + f)) {
                    if (total == fs.statSync(p + f).size) {
                        resolve(p + f);
                        r.abort();
                        return;
                    }
                }
                if (res.statusCode == 200) {
                    const re = res.pipe(fs.createWriteStream(p + f));
                    re.on('finish', () => {
                        resolve(p + f);
                    });
                    re.on('error', () => {
                        reject('文件失效!');
                    });
                } else {
                    reject('文件失效!');
                }
            });
            r.on('data', function (chunk) {
                received += chunk.length;
                const progressVal = received / total;
                if (progressBar) {
                    progressBar.updateProgress(progressVal, `下载中(${that.formatSizeUnits(received) + ' to ' + that.formatSizeUnits(total)})...`, true);
                } else {
                    Ext.getCmp('msg-bar').setProgress(`下载中(${that.formatSizeUnits(received) + ' to ' + that.formatSizeUnits(total)})...`, progressVal);
                }
            });
            r.on('end', function () {
                if (progressBar) {
                    progressBar.updateText('下载完成!');
                } else {
                    Ext.getCmp('msg-bar').closeProgress();
                }
            });
        });
    }

    unZipFile(file, options, target) {
        const unZip = require('decompress');
        const help = require('./help');
        return new Promise((resolve, reject) => {
            const dir = target || help.getDataPath();
            try {
                unZip(file, dir, options).then(files => {
                    resolve(true);
                }).catch(e => {
                    console.log(e);
                    reject(e);
                });
            } catch (e) {
                reject(e);
            }
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

    formatSizeUnits(bytes) {
        if (bytes >= 1073741824) {
            bytes = (bytes / 1073741824).toFixed(2) + " GB";
        } else if (bytes >= 1048576) {
            bytes = (bytes / 1048576).toFixed(2) + " MB";
        } else if (bytes >= 1024) {
            bytes = (bytes / 1024).toFixed(2) + " KB";
        } else if (bytes > 1) {
            bytes = bytes + " bytes";
        } else if (bytes == 1) {
            bytes = bytes + " byte";
        } else {
            bytes = "0 bytes";
        }
        return bytes;
    }

    exportExcel(data, folder, name) {
        const rows = [];
        data.forEach((d, i) => {
            if (i == 0) {
                const title = [];
                for (const k in d) {
                    title.push(k);
                }
                rows.push(title);
            }
            const l = [];
            for (const k in d) {
                l.push(d[k]);
            }
            rows.push(l);
        });
        let buffer = xlsx.build([{
            name: '数据',
            data: rows
        }]);
        const file = `${folder}/${name}.xlsx`;
        fs.writeFileSync(file, buffer, {
            'flag': 'w'
        });
        return file;
    }

    formatDuring(mss) {
        var days = parseInt(mss / (1000 * 60 * 60 * 24));
        var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = (mss % (1000 * 60)) / 1000;
        let s = "";
        if (days > 0) {
            s = s + days + "天";
        }
        if (hours > 0) {
            s = s + hours + "时";
        }
        if (minutes > 0) {
            s = s + minutes + "分";
        }
        return s + (seconds <= 0 ? 1 : seconds) + "秒";
    }
}

module.exports = new Utils();
