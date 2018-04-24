const fs = require('fs');
const utils = require('./utils');
const appRoot = require('app-root-path');
const decompress = require('decompress');
const adapterFor = (function () {
    const url = require('url'),
        adapters = {
            'http:': require('http'),
            'https:': require('https'),
        };

    return function (inputUrl) {
        return adapters[url.parse(inputUrl).protocol]
    }
}());

class JscodeUtil {

    getFolder(id) {
        let path = appRoot.path;
        if (path.indexOf('app.asar') > -1) {
            path = path.replace('app.asar', '').replace('resources\\', '');
        }
        return path + '/jscode/' + id;
    }

    //创建脚本文件夹
    createFolder(id, folder, parentFolder) {
        let dir = this.getFolder(id);
        if (!utils.isEmpty(folder)) {
            if (utils.notEmpty(parentFolder)) {
                dir = dir + '/' + parentFolder + '/' + folder;
                parentFolder = parentFolder + '/' + folder;
            } else {
                dir = dir + '/' + folder;
                parentFolder = folder;
            }
        }
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        return {text: folder, type: 'folder', folder: true, parentFolder: parentFolder};
    }

    createFile(id, fileName, parentFolder) {
        let path = '';
        if (utils.notEmpty(parentFolder)) {
            path = this.getFolder(id) + '/' + parentFolder + '/' + fileName;
            parentFolder = parentFolder + '/' + fileName;
        } else {
            path = this.getFolder(id) + '/' + fileName;
            parentFolder = fileName;
        }
        let status = utils.writeFile({path: path, content: ''});
        return {text: fileName, type: 'file', leaf: true, parentFolder: parentFolder};
    }

    reName(id, oldName, newName, parentFolder) {
        let dir = '';
        if (utils.notEmpty(parentFolder)) {
            dir = this.getFolder(id) + '/' + parentFolder + '/';
        } else {
            dir = this.getFolder(id) + '/';
        }
        fs.renameSync(`${dir}/${oldName}`, `${dir}/${newName}`);
    }

    moveFile(id, oldFolder, newFolder, fileName) {
        let dir = this.getFolder(id);
        fs.renameSync(`${dir}/${oldFolder}`, `${dir}/${newFolder}/${fileName}`);
    }

    getFileAndFolder(id, parentFolder) {
        let path = this.getFolder(id);
        if (utils.notEmpty(parentFolder)) {
            path = path + '/' + parentFolder;
            parentFolder = parentFolder + '/';
        } else {
            parentFolder = '';
        }
        const lists = fs.readdirSync(path);
        const data = [];
        lists.forEach(item => {
            const d = {text: item, parentFolder: parentFolder + item};
            if (fs.statSync(path + '\\' + item).isDirectory()) {
                d.type = 'folder';
                d.folder = true;
            } else {
                d.type = 'file';
                d.leaf = true;
            }
            data.push(d);
        });
        return data;
    }

    unLinkFile(id, file) {
        let path = this.getFolder(id);
        fs.unlink(path + '/' + file, (err) => {
            if (err) console.log('Error:' + err);
        });
    }

    unLinkFolder(id, file) {
        let path = this.getFolder(id) + '/' + file;
        const that = this;
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (f, index) {
                let curPath = path + "/" + f;
                if (fs.lstatSync(curPath).isDirectory()) {
                    that.unLinkFolder(id, file + '/' + f);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }

    readFile(id, file) {
        const dir = this.getFolder(id) + '/' + file;
        return {file: dir, content: utils.readFile(dir)};
    }

    writeFile(file, content) {
        return utils.writeFile({path: file, content: content});
    }

    downloadPkg(id, fileName, url) {
        const that = this, path = that.getFolder(id);
        return new Promise((resolve, reject) => {
            try {
                that.createFolder(id, 'node_modules');
                that.unLinkFolder(id, `/node_modules/${fileName}`);
                const file = fs.createWriteStream(path + `/node_modules/${fileName}.tgz`);
                const request = adapterFor(url).get(url, function (response) {
                    response.pipe(file);
                    response.on('end', () => {
                        decompress(`jscode/${id}/node_modules/${fileName}.tgz`, `jscode/${id}/node_modules`).then(files => {
                            fs.rename(`${path}/node_modules/package`, `${path}/node_modules/${fileName}`, (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    fs.unlink(path + `/node_modules/${fileName}.tgz`, (err) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve(fileName);
                                        }
                                    });
                                }
                            });
                        });
                    });
                });
            } catch (e) {
                reject(e);
            }
        });
    }
}

module.exports = new JscodeUtil();