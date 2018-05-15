const fs = require('fs');
const utils = require('./utils');
const pack = require('../dao/package');
const appRoot = require('app-root-path');
const npmi = require('npmi');
const del = require('del');
const npmu = require('./npmu');

class JscodeUtil {

    getFolder(id) {
        let path = appRoot.path;
        if (path.indexOf('app.asar') > -1) {
            path = path.replace('app.asar', '').replace('resources\\', '');
        }
        return path + '\\jscode\\' + id;
    }

    //创建脚本文件夹
    createFolder(id, folder, parentFolder) {
        let dir = this.getFolder(id);
        if (!utils.isEmpty(folder)) {
            if (utils.notEmpty(parentFolder)) {
                dir = dir + '\\' + parentFolder + '\\' + folder;
                parentFolder = parentFolder + '\\' + folder;
            } else {
                dir = dir + '\\' + folder;
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
            path = this.getFolder(id) + '\\' + parentFolder + '\\' + fileName;
            parentFolder = parentFolder + '\\' + fileName;
        } else {
            path = this.getFolder(id) + '\\' + fileName;
            parentFolder = fileName;
        }
        let status = utils.writeFile({path: path, content: ''});
        return {text: fileName, type: 'file', leaf: true, parentFolder: parentFolder};
    }

    reName(id, oldName, newName, parentFolder) {
        let dir = '';
        if (utils.notEmpty(parentFolder)) {
            dir = this.getFolder(id) + '\\' + parentFolder + '\\';
        } else {
            dir = this.getFolder(id) + '\\';
        }
        fs.renameSync(`${dir}\\${oldName}`, `${dir}\\${newName}`);
    }

    moveFile(id, oldFolder, newFolder, fileName) {
        let dir = this.getFolder(id);
        fs.renameSync(`${dir}\\${oldFolder}`, `${dir}\\${newFolder}\\${fileName}`);
    }

    getFileAndFolder(id, parentFolder) {
        let path = this.getFolder(id);
        if (utils.notEmpty(parentFolder)) {
            path = path + '\\' + parentFolder;
            parentFolder = parentFolder + '\\';
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
        del([path]).then(paths => {
            console.log('Deleted files and folders:\n', paths.join('\n'));
        });
    }

    unLinkFolder(id, file) {
        let path = this.getFolder(id) + '\\' + file;
        del([path]).then(paths => {
            console.log('Deleted files and folders:\n', paths.join('\n'));
        });
    }

    readFile(id, file) {
        const dir = this.getFolder(id) + '\\' + file;
        return {file: dir, content: utils.readFile(dir)};
    }

    writeFile(file, content) {
        return utils.writeFile({path: file, content: content});
    }

    downloadPkg(id, fileName, version) {
        const that = this, path = that.getFolder(id);
        return new Promise((resolve, reject) => {
            try {
                if (utils.isEmpty(version)) {
                    version = 'latest';
                }
                const options = {
                    name: fileName,	// your module name
                    version: version,		// expected version [default: 'latest']
                    path: path,				// installation path [default: '.']
                    forceInstall: false,	// force install if set to true (even if already installed, it will do a reinstall) [default: false]
                    npmLoad: {				// npm.load(options, callback): this is the "options" given to npm.load()
                        loglevel: 'silent'	// [default: {loglevel: 'silent'}]
                    }
                };
                npmi(options, function (err, result) {
                    if (err) {
                        if (err.code === npmi.LOAD_ERR) reject('npm load error');
                        else if (err.code === npmi.INSTALL_ERR) reject('npm install error');
                        else reject(err.message);
                    }
                    pack.add({pId: id, name: fileName, version: version, date: utils.getNowTime()});
                    resolve(options.name + '@' + version);
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }

    unInstallPkg(id, fileName) {
        const that = this, path = that.getFolder(id);
        return new Promise((resolve, reject) => {
            try {
                const options = {
                    name: fileName,	// your module name
                    path: path,				// installation path [default: '.']
                    forceInstall: false,	// force install if set to true (even if already installed, it will do a reinstall) [default: false]
                    npmLoad: {				// npm.load(options, callback): this is the "options" given to npm.load()
                        loglevel: 'silent'	// [default: {loglevel: 'silent'}]
                    }
                };
                npmu(options, function (err, result) {
                    if (err) {
                        if (err.code === npmu.LOAD_ERR) reject('npm load error');
                        else if (err.code === npmu.INSTALL_ERR) reject('npm uninstall error');
                        else reject(err.message);
                    }
                    pack.remove(fileName);
                    resolve(options.name);
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }

    unInstallAll(id, names) {
        const that = this, path = that.getFolder(id);
        return new Promise((resolve, reject) => {
            try {
                const options = {
                    names: names,
                    multiple: true,
                    path: path,				// installation path [default: '.']
                    forceInstall: false,	// force install if set to true (even if already installed, it will do a reinstall) [default: false]
                    npmLoad: {				// npm.load(options, callback): this is the "options" given to npm.load()
                        loglevel: 'silent'	// [default: {loglevel: 'silent'}]
                    }
                };
                npmu(options, function (err, result) {
                    names.forEach( fileName => {
                        pack.remove(fileName);
                    });
                    resolve(options.names.join(','));
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
}

module.exports = new JscodeUtil();