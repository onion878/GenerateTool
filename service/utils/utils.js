const fs = require('fs');
const shell = require('shelljs');

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

    getNowTime(){
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
            const filePath = path.substring(0,path.lastIndexOf(`/`));
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
        return fs.readFileSync(path, 'utf8');
    }
}

module.exports = new Utils();