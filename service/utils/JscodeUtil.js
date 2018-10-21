const fs = require('fs');
const utils = require('./utils');
const pack = require('../dao/package');
const appRoot = require('app-root-path');
const npmi = require('npmi');
const del = require('del');
const npmu = require('./npmu');
const archiver = require('archiver');

class JscodeUtil {

    getFolder(id) {
        let path = appRoot.path.replace(/\\/g, '/');
        if (path.indexOf('app.asar') > -1) {
            path = path.replace('app.asar', '').replace('resources/', '');
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

    //创建文件夹
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
            if (fs.statSync(path + '/' + item).isDirectory()) {
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

    unLinkFile(id, folder) {
        let path = this.getFolder(id) + '/' + folder;
        del([path]).then(paths => {
            console.log('Deleted files and folders:\n', paths.join('\n'));
        });
    }

    unLinkFolder(id, file) {
        let path = this.getFolder(id) + '/' + file;
        del([path]).then(paths => {
            console.log('Deleted files and folders:\n', paths.join('\n'));
        });
    }

    readFile(id, file) {
        const dir = this.getFolder(id) + '/' + file;
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
                    names.forEach(fileName => {
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

    runNodeJs(content) {
        return eval(content);
    }

    exportModule({id, text, folder}) {
        const path = appRoot.path.replace(/\\/g, '/').replace('/resources/app.asar', ''), that = this;
        return new Promise(function (resolve, reject) {
            const output = fs.createWriteStream(`${folder}/${text}.zip`);
            const archive = archiver('zip', {
                zlib: {level: 9}
            });

            output.on('close', function () {
                resolve('ok');
            });

            output.on('end', function () {
                console.log('Data has been drained');
            });

            archive.on('error', function (err) {
                reject(err);
            });

            if (fs.existsSync(`${path}/jscode/${id}/node_modules`)) {
                const dir = `${path}/jscode/${id}_lib`;
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }

                fs.rename(`${path}/jscode/${id}/node_modules`, `${dir}/node_modules`, (err) => {
                    if (err) throw err;
                    archive.pipe(output);
                    archive.append(that.getAllExportData(id), {name: 'data.json'});
                    archive.directory(`jscode/${id}/`, id);
                    archive.finalize();
                    fs.rename(`${dir}/node_modules`, `${path}/jscode/${id}/node_modules`, (err) => {
                        if (err) throw err;
                        del([dir]);
                    });
                });
            } else {
                archive.pipe(output);
                archive.append(that.getAllExportData(id), {name: 'data.json'});
                archive.directory(`jscode/${id}/`, id);
                archive.finalize();
            }
        });
    }

    getAllExportData(id) {
        const data = {controls: {}, file: {}, gefile: {}, mode: {}, modeData: {}, package: {}};
        const controls = require('../dao/controls.js');
        const controlsData = controls.getExtByPid(id);
        data.controls['ext'] = controlsData;
        const controlsDataCode = [];
        controlsData.forEach(c => {
            const code = controls.getCodeById(c.id);
            if (code != undefined) {
                controlsDataCode.push(code);
            }
        });
        data.controls['code'] = controlsDataCode;
        const file = require('../dao/file.js');
        data.file['data'] = file.getExportData(id);
        const gefile = require('../dao/gefile.js');
        data.gefile['data'] = gefile.getFileData(id);
        const mode = require('../dao/mode.js');
        data.mode['data'] = [mode.getById(id)];
        const modeData = require('../dao/modeData.js');
        data.modeData['data'] = modeData.getData(id);
        const pack = require('../dao/package.js');
        data.package['data'] = pack.getAll(id);
        return JSON.stringify(data);
    }

    importModule(file) {
        const unZip = require('decompress');
        const path = appRoot.path.replace(/\\/g,'/').replace('/resources/app.asar', ''), that = this;
        return new Promise((resolve, reject) => {
            const dir = `${path}/data/cache`;
            try {
                unZip(file, dir).then(files => {
                    const data = JSON.parse(utils.readFile(`${dir}/data.json`));
                    const controls = data['controls'], file = data['file'], gefile = data['gefile'], mode = data['mode'], modeData = data['modeData'], pack= data['package'];
                    const oldPid = mode.data[0].id;
                    let pId = that.getNewPid(oldPid);
                    const modeFolder = dir + '/' + mode.data[0].id;
                    if (!fs.existsSync(modeFolder)) { 
                        controls['ext'].forEach( e => e.pId = pId);
                        file['data'].forEach( e => e.pId = pId);
                        gefile['data'].forEach( e => e.pId = pId);
                        mode['data'].forEach( e => e.id = pId);
                        modeData['data'].forEach( e => e.pId = pId);
                        pack['data'].forEach( e => e.pId = pId);
                        require('../dao/controls.js').addAllData(controls);
                        require('../dao/file.js').addAllData(file);
                        require('../dao/gefile.js').addAllData(gefile);
                        require('../dao/mode.js').addAllData(mode);
                        require('../dao/modeData.js').addAllData(modeData);
                        require('../dao/package.js').addAllData(pack);
                        del([dir]);
                        resolve(`[${mode.data[0].text}]导入成功!`);
                    } else {
                        fs.rename(modeFolder, `${path}/jscode/${pId}`, (err) => {
                            if (err) throw err;
                            controls['ext'].forEach( e => e.pId = pId);
                            file['data'].forEach( e => e.pId = pId);
                            gefile['data'].forEach( e => e.pId = pId);
                            mode['data'].forEach( e => e.id = pId);
                            modeData['data'].forEach( e => e.pId = pId);
                            pack['data'].forEach( e => e.pId = pId);
                            require('../dao/controls.js').addAllData(controls);
                            require('../dao/file.js').addAllData(file);
                            require('../dao/gefile.js').addAllData(gefile);
                            require('../dao/mode.js').addAllData(mode);
                            require('../dao/modeData.js').addAllData(modeData);
                            require('../dao/package.js').addAllData(pack);
                            del([dir]);
                            resolve(`[${mode.data[0].text}]导入成功!`);
                        });
                    }
                });
            }catch (e) {
                reject(e);
            }
        });
    }

    getNewPid(pId) {
        const modules = require('../dao/mode.js').getAll(), that = this;
        modules.some( ({id}) => {
            if(id == pId) {
                pId = utils.getUUID();
                that.getNewPid(pId);
                return true;
            }
        });
        return pId;
    }

    removeModule(pId) {
        require('../dao/controls.js').removeAll(pId);
        require('../dao/file.js').removeAll(pId);
        require('../dao/gefile.js').removeAll(pId);
        require('../dao/mode.js').removeAll(pId);
        require('../dao/modeData.js').removeAll(pId);
        require('../dao/package.js').removeAll(pId);
        const path = appRoot.path.replace(/\\/g, '/').replace('/resources/app.asar', ''), that = this;
        del([`${path}/jscode/${pId}`]);
    }
}

module.exports = new JscodeUtil();