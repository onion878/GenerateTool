const fs = require('fs');
const help = require('./help');
const utils = require('./utils');
const pack = require('../dao/package');
const controls = require('../dao/controls');
const del = require('del');
const archiver = require('archiver');

class JscodeUtil {

    getFolder(id) {
        return help.getDataPath() + 'jscode/' + id;
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
        const data = [];
        try {
            const lists = fs.readdirSync(path);
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
        } catch (e) {
        }
        return data;
    }

    deleteFile(file) {
        del([file], {force: true}).then(paths => {
            console.log('Deleted files and folders:\n', paths.join('\n'));
        });
    }

    unLinkFile(id, folder) {
        let path = this.getFolder(id) + '/' + folder;
        del([path], {force: true}).then(paths => {
            console.log('Deleted files and folders:\n', paths.join('\n'));
        });
    }

    unLinkFolder(id, file) {
        let path = this.getFolder(id) + '/' + file;
        del([path], {force: true}).then(paths => {
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

    //downloadPkg
    savePkg(id, fileName, version) {
        const that = this;
        return new Promise((resolve, reject) => {
            try {
                if (utils.isEmpty(version)) {
                    version = 'latest';
                }
                pack.add({pId: id, name: fileName, version: version, date: utils.getNowTime()});
                resolve(fileName + '@' + version);
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }

    deletePkg(id, fileName) {
        const that = this;
        return new Promise((resolve, reject) => {
            try {
                pack.remove(id, fileName);
                resolve(fileName);
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }

    deleteAllPkg(id, names) {
        const that = this;
        return new Promise((resolve, reject) => {
            try {
                names.forEach(fileName => {
                    pack.remove(id, fileName);
                });
                resolve(names.join(','));
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
        const path = help.getDataPath(), that = this;
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
                    archive.directory(`${path}jscode/${id}/`, id);
                    archive.finalize();
                    fs.rename(`${dir}/node_modules`, `${path}/jscode/${id}/node_modules`, (err) => {
                        if (err) throw err;
                        del([dir], {force: true});
                    });
                });
            } else {
                archive.pipe(output);
                archive.append(that.getAllExportData(id), {name: 'data.json'});
                archive.directory(`${path}jscode/${id}/`, id);
                archive.finalize();
            }
        });
    }

    getAllExportData(id) {
        const data = {controls: {}, file: {}, gefile: {}, mode: {}, modeData: {}, package: {}};
        const controls = require('../dao/controls.js');
        const controlsData = controls.getExtByPid(id);
        data.controls['ext'] = controlsData;
        data.controls['code'] = controls.getCodeByPid(id);
        const file = require('../dao/file.js');
        data.file['data'] = file.getExportData(id);
        const gefile = require('../dao/gefile.js');
        data.gefile['data'] = gefile.getFileData(id);
        data.gefile['swig'] = gefile.getFileSwig(id);
        data.gefile['shell'] = gefile.getFileShell(id);
        data.gefile['beforeShell'] = gefile.getFilBeforeShell(id);
        const mode = require('../dao/mode.js');
        data.mode['data'] = [mode.getById(id)];
        const modeData = require('../dao/modeData.js');
        data.modeData['data'] = modeData.getData(id);
        const pack = require('../dao/package.js');
        data.package['data'] = pack.getAll(id);
        return JSON.stringify(data);
    }

    importModule(file, newName, serveId, detailId) {
        const unZip = require('decompress');
        const path = help.getDataPath(), that = this;
        return new Promise((resolve, reject) => {
            const dir = `${path}/data/cache`;
            try {
                unZip(file, dir).then(files => {
                    const data = JSON.parse(utils.readFile(`${dir}/data.json`));
                    const controls = data['controls'], file = data['file'], gefile = data['gefile'],
                        mode = data['mode'], modeData = data['modeData'], pack = data['package'];
                    const oldPid = mode.data[0].id;
                    let pId = that.getNewPid(oldPid), list = {};
                    if (utils.isEmpty(newName)) {
                        newName = that.getNewModuleName(mode['data'][0].text, 1);
                    }
                    mode['data'][0].text = newName;
                    const modeFolder = dir + '/' + mode.data[0].id;
                    if (!fs.existsSync(modeFolder)) {
                        modeData['data'].forEach(e => {
                            e.pId = pId;
                            const cId = this.getNewCid(e.id);
                            list[e.id] = cId;
                            e.id = cId;
                        });
                        controls['ext'].forEach(e => {
                            e.pId = pId;
                            e.cId = list[e.cId];
                        });
                        controls['code'].forEach(e => {
                            e.cId = list[e.cId];
                            e.pId = pId;
                        });
                        file['data'].forEach(e => e.pId = pId);
                        gefile['data'].forEach(e => e.pId = pId);
                        gefile['swig'].forEach(e => e.pId = pId);
                        try {
                            gefile['shell'].forEach(e => e.pId = pId);
                        } catch (e) {

                        }
                        try {
                            gefile['beforeShell'].forEach(e => e.pId = pId);
                        } catch (e) {

                        }
                        mode['data'].forEach(e => e.id = pId);
                        if (!utils.isEmpty(serveId)) {
                            mode['data'].forEach(e => e.serveId = serveId);
                            mode['data'].forEach(e => e.detailId = detailId);
                        }
                        pack['data'].forEach(e => e.pId = pId);
                        require('../dao/controls.js').addAllData(controls);
                        require('../dao/file.js').addAllData(file);
                        require('../dao/gefile.js').addAllData(gefile);
                        require('../dao/mode.js').addAllData(mode);
                        require('../dao/modeData.js').addAllData(modeData);
                        require('../dao/package.js').addAllData(pack);
                        del([dir], {force: true});
                        resolve({msg: `[${mode.data[0].text}]导入成功!`, pId: pId});
                    } else {
                        fs.rename(modeFolder, `${path}/jscode/${pId}`, (err) => {
                            modeData['data'].forEach(e => {
                                e.pId = pId;
                                const cId = this.getNewCid(e.id);
                                list[e.id] = cId;
                                e.id = cId;
                            });
                            controls['ext'].forEach(e => {
                                e.pId = pId;
                                e.cId = list[e.cId];
                            });
                            controls['code'].forEach(e => {
                                e.cId = list[e.cId];
                                e.pId = pId;
                            });
                            file['data'].forEach(e => e.pId = pId);
                            gefile['data'].forEach(e => e.pId = pId);
                            gefile['swig'].forEach(e => e.pId = pId);
                            try {
                                gefile['shell'].forEach(e => e.pId = pId);
                            } catch (e) {

                            }
                            try {
                                gefile['beforeShell'].forEach(e => e.pId = pId);
                            } catch (e) {

                            }
                            mode['data'].forEach(e => e.id = pId);
                            if (!utils.isEmpty(serveId)) {
                                mode['data'].forEach(e => e.serveId = serveId);
                                mode['data'].forEach(e => e.detailId = detailId);
                            }
                            pack['data'].forEach(e => e.pId = pId);
                            require('../dao/controls.js').addAllData(controls);
                            require('../dao/file.js').addAllData(file);
                            require('../dao/gefile.js').addAllData(gefile);
                            require('../dao/mode.js').addAllData(mode);
                            require('../dao/modeData.js').addAllData(modeData);
                            require('../dao/package.js').addAllData(pack);
                            del([dir], {force: true});
                            resolve({msg: `[${mode.data[0].text}]导入成功!`, pId: pId});
                        });
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    updateTemplate(file, local, tempData) {
        const unZip = require('decompress');
        const path = help.getDataPath(), that = this;
        return new Promise((resolve, reject) => {
            const dir = `${path}data/cache`, codeFolder = `${path}jscode/${local.id}`;
            try {
                unZip(file, dir).then(files => {
                    const data = JSON.parse(utils.readFile(`${dir}/data.json`));
                    const controls = data['controls'], file = data['file'], gefile = data['gefile'],
                        modeData = data['modeData'], pack = data['package'];
                    require('../dao/controls.js').updateAll({...controls, pId: local.id});
                    require('../dao/file.js').updateAll({...file, pId: local.id});
                    require('../dao/gefile.js').updateAll({...gefile, pId: local.id});
                    require('../dao/mode.js').updateTemplate(local.id, local.serveId, tempData.id);
                    require('../dao/modeData.js').updateAll({...modeData, pId: local.id});
                    require('../dao/package.js').updateAll({...pack, pId: local.id});
                    if (fs.existsSync(dir + '/' + local.id)) {
                        that.copyDir(dir + '/' + local.id, codeFolder, function (err) {
                            if (err) {
                                del([dir], {force: true});
                                reject(err);
                            }
                        });
                    }
                    del([dir], {force: true});
                    resolve(true);
                }).catch(e => {
                    del([dir], {force: true});
                    reject(e);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    copyDir(src, dist, callback) {
        const that = this;
        if(!fs.existsSync(dist)) {
            fs.mkdirSync(dist);
        }
        _copy(null, src, dist);
        function _copy(err, src, dist) {
            if (err) {
                callback(err);
            } else {
                fs.readdir(src, function (err, paths) {
                    if (err) {
                        callback(err)
                    } else {
                        paths.forEach(function (path) {
                            const _src = src + '/' + path;
                            const _dist = dist + '/' + path;
                            fs.stat(_src, function (err, stat) {
                                if (err) {
                                    callback(err);
                                } else {
                                    // 判断是文件还是目录
                                    if (stat.isFile()) {
                                        fs.writeFileSync(_dist, fs.readFileSync(_src));
                                    } else if (stat.isDirectory()) {
                                        // 当是目录是，递归复制
                                        that.copyDir(_src, _dist, callback)
                                    }
                                }
                            })
                        });
                    }
                })
            }
        }
    }

    getNewModuleName(name, total) {
        const modules = require('../dao/mode.js').getAll(), that = this;
        let flag = false;
        modules.forEach(({text}) => {
            if (name.trim() == text.trim()) {
                flag = true;
            }
        });
        if (flag) {
            if (total > 1) {
                name = name.replace('(' + (total - 1) + ')', '(' + total + ')');
            } else {
                name = name + '(' + total + ')';
            }
            return that.getNewModuleName(name, total + 1);
        }
        return name;
    }

    getNewPid(pId) {
        const modules = require('../dao/mode.js').getAll(), that = this;
        let flag = false;
        modules.some(({id}) => {
            if (id == pId) {
                flag = true;
                return true;
            }
        });
        if (flag) {
            pId = utils.getUUID();
            return that.getNewPid(pId);
        }
        return pId;
    }

    getNewCid(cId) {
        const modules = require('../dao/modeData.js').getAll(), that = this;
        let flag = false;
        modules.some(({id}) => {
            if (id == cId) {
                flag = true;
                return true;
            }
        });
        if (flag) {
            cId = utils.getUUID();
            return that.getNewCid(cId);
        }
        return cId;
    }

    removeModule(pId) {
        require('../dao/controls.js').removeAll(pId);
        require('../dao/file.js').removeAll(pId);
        require('../dao/gefile.js').removeAll(pId);
        require('../dao/mode.js').removeAll(pId);
        require('../dao/modeData.js').removeAll(pId);
        require('../dao/package.js').removeAll(pId);
        const path = help.getDataPath();
        return new Promise((resolve, reject) => {
            del([`${path}jscode/${pId}`], {force: true}).then((p) => {
                resolve(p);
            }).catch(e => reject(e));
        });
    }

    initFile(pId) {
        const path = this.getFolder(pId);
        fs.writeFileSync(path + '/data.js', 'let data=' + JSON.stringify(controls.getModuleData(pId)) + ';try {data = getAllData();}catch (e) {}module.exports = data;', 'utf8');
        if (!fs.existsSync(path + '/package.json')) {
            fs.writeFileSync(path + '/package.json', `{}`, 'utf8');
        }
    }
}

module.exports = new JscodeUtil();
