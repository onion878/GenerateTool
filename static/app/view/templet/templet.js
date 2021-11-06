Ext.define('OnionSpace.view.templet.templet', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.templet',
    requires: [
        'OnionSpace.controller.Templet'
    ],
    controller: 'Templet',
    tbar: [{
        xtype: 'button',
        text: '刷新',
        icon: 'images/refresh.svg',
        action: 'refreshGrid'
    }, {
        xtype: 'button',
        text: '导入模板',
        icon: 'images/import.svg',
        action: 'importModule'
    }, {
        xtype: 'button',
        text: '复制模板',
        icon: 'images/copy.svg',
        action: 'copyModule'
    }],
    initComponent: function () {
        const pId = this.pId, that = this;
        let token = execute('userConfig', 'getAuth');
        this.store = Ext.create('Ext.data.Store', {
            storeId: 'id',
            fields: ['id', 'text'],
            data: execute('parentData', 'getAll')
        });
        this.plugins = {
            ptype: 'rowediting',
            clicksToMoveEditor: 1,
            autoUpdate: true,
            autoCancel: false,
            listeners: {
                edit: function (editor, e, eOpts) {
                    e.record.commit();
                    editor.grid.getStore().getData().items.forEach(({data}) => {
                        execute('parentData', 'updateText', [data]);
                    });
                }
            }
        };
        this.columns = [
            new Ext.grid.RowNumberer(),
            {
                text: '名称', align: 'center', dataIndex: 'text', flex: 1, editor: {
                    xtype: 'textfield'
                }
            },
            {
                text: '创建时间', align: 'center', dataIndex: 'date', flex: 1
            },
            {
                text: '操作',
                flex: 1,
                align: 'center',
                xtype: 'widgetcolumn',
                widget: {
                    xtype: 'toolbar',
                    style: {
                        background: 'transparent',
                        padding: '0'
                    },
                    layout: {
                        pack: 'center'
                    },
                    items: [
                        {
                            xtype: 'button',
                            text: '导出',
                            handler: function (btn) {
                                const data = btn.up().getWidgetRecord().getData();
                                const remote = require('electron').remote;
                                const dialog = remote.dialog;
                                dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openDirectory']}).then(({
                                                                                                                            canceled,
                                                                                                                            filePaths
                                                                                                                        }) => {
                                    if (!canceled && filePaths != undefined && !utils.isEmpty(filePaths[0])) {
                                        data.folder = filePaths[0];
                                        const el = btn.up('templet').getEl();
                                        el.mask('导出中...');
                                        data.newId = utils.getUUID();
                                        jsCode.exportModule(data).then(t => {
                                            el.unmask();
                                            showToast(`[success] 导出为[${data.folder}\\${data.text}.zip]`);
                                        }).catch(err => {
                                            console.error(err);
                                            showError(err);
                                            el.unmask();
                                        });
                                    }
                                });
                            }
                        }, '-', {
                            xtype: 'button',
                            text: '导出为脚本项目',
                            handler: function (btn) {
                                const data = btn.up().getWidgetRecord().getData();
                                const help = require('../service/utils/help');
                                let winFlag = utils.fileExists(help.getDataPath() + 'node-v12.19.0-win-x64/node.exe');
                                let linuxFlag = utils.fileExists(help.getDataPath() + 'node-v12.19.0-linux-x64/bin/node');
                                Ext.create('Ext.window.Window', {
                                    title: '模板说明',
                                    width: 550,
                                    layout: 'fit',
                                    resizable: true,
                                    maximizable: true,
                                    constrain: true,
                                    animateTarget: btn,
                                    items: {
                                        xtype: 'form',
                                        layout: {
                                            type: 'vbox',
                                            pack: 'start',
                                            align: 'stretch'
                                        },
                                        items: [
                                            {
                                                xtype: 'container',
                                                layout: 'hbox',
                                                margin: '10',
                                                items: [
                                                    {
                                                        xtype: 'label',
                                                        text: "导出位置",
                                                        margin: {
                                                            top: 3
                                                        },
                                                        width: 90
                                                    },
                                                    {
                                                        xtype: 'textfield',
                                                        name: 'folder',
                                                        emptyText: '选择导出位置',
                                                        allowBlank: false,
                                                        flex: 1
                                                    },
                                                    {
                                                        xtype: 'button',
                                                        text: '选择文件夹',
                                                        handler: function (btn) {
                                                            const remote = require('electron').remote;
                                                            const dialog = remote.dialog;
                                                            dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openDirectory']}).then(({
                                                                                                                                                        canceled,
                                                                                                                                                        filePaths
                                                                                                                                                    }) => {
                                                                if (!canceled && filePaths != undefined && !utils.isEmpty(filePaths[0])) {
                                                                    btn.up('container').down('textfield').setRawValue(filePaths[0]);
                                                                }
                                                            });
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                xtype: 'container',
                                                layout: 'hbox',
                                                margin: '10',
                                                items: [
                                                    {
                                                        xtype: 'label',
                                                        text: "包含导出平台",
                                                        margin: {
                                                            top: 3
                                                        },
                                                        width: 90
                                                    },
                                                    {
                                                        xtype: 'checkboxgroup',
                                                        name: 'platform',
                                                        allowBlank: false,
                                                        id: 'platform',
                                                        flex: 1,
                                                        items: [
                                                            {boxLabel: 'windows', inputValue: 0, checked: true},
                                                            {boxLabel: 'linux', inputValue: 1, checked: true}
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                xtype: 'container',
                                                layout: 'hbox',
                                                margin: '10',
                                                items: [
                                                    {
                                                        xtype: 'label',
                                                        text: "导出类型",
                                                        margin: {
                                                            top: 3
                                                        },
                                                        width: 90
                                                    },
                                                    {
                                                        xtype: 'radiogroup',
                                                        name: 'type',
                                                        allowBlank: false,
                                                        flex: 1,
                                                        items: [
                                                            {boxLabel: '轻量模式(需node环境)', inputValue: 0, checked: true},
                                                            {boxLabel: '完整模式(包含node程序)', inputValue: 1, checked: false}
                                                        ],
                                                        listeners: {
                                                            change: function (dom, val) {
                                                                const {platform} = dom.up('form').down('#platform').getValue();
                                                                if (platform === undefined) {
                                                                    Ext.toast({
                                                                        html: `<span style="color: red">请至少选择一个导出平台!</span>`,
                                                                        closable: false,
                                                                        align: 't',
                                                                        slideInDuration: 400
                                                                    });
                                                                    return;
                                                                }
                                                                if (val['type'] === 1) {
                                                                    if (platform instanceof Array) {
                                                                        dom.up('form').down('#windows-download').setVisible(true);
                                                                        dom.up('form').down('#linux-download').setVisible(true);
                                                                    } else {
                                                                        dom.up('form').down('#windows-download').setVisible(platform == 0);
                                                                        dom.up('form').down('#linux-download').setVisible(platform == 1);
                                                                    }
                                                                } else {
                                                                    dom.up('form').down('#windows-download').setVisible(false);
                                                                    dom.up('form').down('#linux-download').setVisible(false);
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                xtype: 'container',
                                                layout: 'hbox',
                                                hidden: true,
                                                margin: '10',
                                                id: 'windows-download',
                                                items: [
                                                    {
                                                        xtype: 'label',
                                                        text: "Windows程序",
                                                        margin: {
                                                            top: 3
                                                        },
                                                        width: 90
                                                    },
                                                    {
                                                        id: 'windows-progress',
                                                        xtype: 'progressbar',
                                                        animate: true,
                                                        animateShadow: true,
                                                        flex: 1,
                                                        listeners: {
                                                            render: function (dom) {
                                                                if (winFlag) {
                                                                    dom.updateText('node.exe文件可用!');
                                                                } else {
                                                                    dom.updateText('node.exe文件不可用,请下载!');
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        xtype: 'button',
                                                        text: winFlag ? '重新下载' : '下载',
                                                        id: 'windows-progress-download',
                                                        handler: function (btn) {
                                                            btn.hide();
                                                            btn.up('form').down('#windows-progress').updateText('文件下载中,请稍等...!');
                                                            utils.downloadFile('node-v12.19.0-win-x64.zip', 'node-v12.19.0-win-x64.zip', 'https://cdn.npm.taobao.org/dist/node/v12.19.0/node-v12.19.0-win-x64.zip', btn.up('form').down('#windows-progress')).then(d => {
                                                                btn.up('window').mask('解压中,请稍等...');
                                                                const path = require('path');
                                                                utils.unZipFile(d, {
                                                                    filter: file => {
                                                                        return file.type == 'file' && path.basename(file.path) == 'node.exe'
                                                                    }
                                                                }).then(f => {
                                                                    if (f) {
                                                                        btn.up('window').unmask();
                                                                        btn.up('form').down('#windows-progress').updateText('node.exe文件可用!');
                                                                        btn.setText('重新下载');
                                                                        btn.show();
                                                                        winFlag = true;
                                                                    }
                                                                })
                                                            }).catch(err => {
                                                                Ext.toast({
                                                                    html: `<span style="color: red">下载出错,请检查网络后重新尝试!</span>`,
                                                                    closable: false,
                                                                    align: 't',
                                                                    slideInDuration: 400
                                                                });
                                                            });
                                                        }
                                                    },
                                                ]
                                            },
                                            {
                                                xtype: 'container',
                                                layout: 'hbox',
                                                margin: '10',
                                                hidden: true,
                                                id: 'linux-download',
                                                items: [
                                                    {
                                                        xtype: 'label',
                                                        text: "Linux程序",
                                                        margin: {
                                                            top: 3
                                                        },
                                                        width: 90
                                                    },
                                                    {
                                                        id: 'linux-progress',
                                                        xtype: 'progressbar',
                                                        animate: true,
                                                        animateShadow: true,
                                                        flex: 1,
                                                        listeners: {
                                                            render: function (dom) {
                                                                if (linuxFlag) {
                                                                    dom.updateText('node二进制文件可用!');
                                                                } else {
                                                                    dom.updateText('node二进制文件不可用,请下载!');
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        xtype: 'button',
                                                        text: linuxFlag ? '重新下载' : '下载',
                                                        id: 'linux-progress-download',
                                                        handler: function (btn) {
                                                            btn.hide();
                                                            btn.up('form').down('#linux-progress').updateText('文件下载中,请稍等...!');
                                                            utils.downloadFile('node-v12.19.0-linux-x64.tar.gz', 'node-v12.19.0-linux-x64.tar.gz', 'https://cdn.npm.taobao.org/dist/node/v12.19.0/node-v12.19.0-linux-x64.tar.gz', btn.up('form').down('#linux-progress')).then(d => {
                                                                btn.up('window').mask('解压中,请稍等...');
                                                                const path = require('path');
                                                                utils.unZipFile(d, {
                                                                    filter: file => {
                                                                        return file.type == 'file' && path.basename(file.path) == 'node'
                                                                    }
                                                                }).then(f => {
                                                                    if (f) {
                                                                        btn.up('window').unmask();
                                                                        btn.up('form').down('#linux-progress').updateText('node二进制文件可用!');
                                                                        btn.setText('重新下载');
                                                                        btn.show();
                                                                        linuxFlag = true;
                                                                    }
                                                                });
                                                            }).catch(err => {
                                                                Ext.toast({
                                                                    html: `<span style="color: red">下载出错,请检查网络后重新尝试!</span>`,
                                                                    closable: false,
                                                                    align: 't',
                                                                    slideInDuration: 400
                                                                });
                                                            });
                                                        }
                                                    },
                                                ]
                                            },
                                        ]
                                    },
                                    buttons: [
                                        {
                                            text: '导出脚本',
                                            handler: function (btn) {
                                                const form = btn.up('window').down('form').getForm();
                                                if (form.isValid()) {
                                                    const p = help.getDataPath();
                                                    const {folder, platform, type} = form.getValues();
                                                    const source = folder + "/" + data.text;
                                                    let continueFlag = true;
                                                    if (type == 1) {
                                                        if (platform instanceof Array) {
                                                            continueFlag = linuxFlag && winFlag
                                                        }
                                                        if (platform == 0) {
                                                            continueFlag = winFlag
                                                        }
                                                        if (platform == 1) {
                                                            continueFlag = linuxFlag
                                                        }
                                                    }
                                                    if (continueFlag === false) {
                                                        Ext.toast({
                                                            html: `<span style="color: red">请保证导出平台已经下载node程序!</span>`,
                                                            closable: false,
                                                            align: 't',
                                                            slideInDuration: 400
                                                        });
                                                        return;
                                                    }
                                                    btn.up('window').mask('导出中,请稍等...');
                                                    setTimeout(() => {
                                                        showToast('[info] 导出[' + data.text + ']路径为: ' + source);
                                                        utils.createFolder(source);
                                                        // 复制node程序
                                                        if (type == 1) {
                                                            showToast(`[info] 开始复制node程序...`);
                                                            if (platform instanceof Array) {
                                                                jsCode.copyFile(p + "node-v12.19.0-win-x64/node.exe", source);
                                                                jsCode.copyFile(p + "node-v12.19.0-linux-x64/bin/node", source);
                                                                jsCode.writeFile(source + "/run.bat", "node.exe run.js\npause");
                                                                jsCode.writeFile(source + "/eval.bat", "node.exe index.js\npause");
                                                                jsCode.writeFile(source + "/run.sh", "./node run.js");
                                                                jsCode.writeFile(source + "/eval.sh", "./node index.js");
                                                            }
                                                            if (platform == 0) {
                                                                jsCode.copyFile(p + "node-v12.19.0-win-x64/node.exe", source);
                                                                jsCode.writeFile(source + "/run.bat", "node.exe run.js\npause");
                                                                jsCode.writeFile(source + "/eval.bat", "node.exe index.js\npause");
                                                            }
                                                            if (platform == 1) {
                                                                jsCode.copyFile(p + "node-v12.19.0-linux-x64/bin/node", source);
                                                                jsCode.writeFile(source + "/run.sh", "./node run.js");
                                                                jsCode.writeFile(source + "/eval.sh", "./node index.js");
                                                            }
                                                            showToast(`[info] 复制node程序成功!`);
                                                        } else {
                                                            if (platform instanceof Array) {
                                                                jsCode.writeFile(source + "/run.bat", "node run.js\npause");
                                                                jsCode.writeFile(source + "/eval.bat", "node index.js\npause");
                                                                jsCode.writeFile(source + "/run.sh", "node run.js");
                                                                jsCode.writeFile(source + "/eval.sh", "node index.js");
                                                            }
                                                            if (platform == 0) {
                                                                jsCode.writeFile(source + "/run.bat", "node run.js\npause");
                                                                jsCode.writeFile(source + "/eval.bat", "node index.js\npause");
                                                            }
                                                            if (platform == 1) {
                                                                jsCode.writeFile(source + "/run.sh", "node run.js");
                                                                jsCode.writeFile(source + "/eval.sh", "node index.js");
                                                            }
                                                        }
                                                        // 复制js脚本
                                                        jsCode.copyDir(p + "jscode/" + data.id, source + "/jscode", function (err) {
                                                            if (path.dirname(err) == path.dirname(source + "/jscode/data.js") && path.basename(err) == 'data.js') {
                                                                jsCode.writeFile(source + "/jscode/data.js", "module.exports = require('../data.json');");
                                                            }
                                                        });
                                                        showToast('[info] 复制脚本成功!');
                                                        // 处理基础数据
                                                        const configData = execute('controlData', 'getModuleData', [data.id]);
                                                        jsCode.writeFile(source + "/data.json", JSON.stringify(configData, null, "\t"));
                                                        showToast('[info] 处理数据成功!');
                                                        const files = [], templates = [],
                                                            generatorData = execute('geFileData', 'getFileData', [data.id]);
                                                        const allModuleData = execute('controlData', 'getModuleData', [data.id]);
                                                        generatorData.forEach(f => {
                                                            if (!utils.isEmpty(f.file) && !utils.isEmpty(f.content)) {
                                                                const file = execute('fileData', 'getFile', [f.id]);
                                                                if (file) {
                                                                    const updateType = file.updateType;
                                                                    f.file = f.file.replace(/\\/g, '\/');
                                                                    const tpl = swig.compile(f.file);
                                                                    f.name = tpl(allModuleData).replace(/\\/g, '\/');
                                                                    const flag = utils.fileExists(f.name);
                                                                    if (flag) {
                                                                        f.flag = '是';
                                                                    } else {
                                                                        f.flag = '否';
                                                                    }
                                                                    f.type = updateType;
                                                                    templates.push(f);
                                                                    files.push({
                                                                        file: f.name,
                                                                        type: updateType,
                                                                        exits: f.flag
                                                                    });
                                                                }
                                                            }
                                                        });
                                                        jsCode.writeFile(source + "/file.json", JSON.stringify(files, null, "\t"));
                                                        // 处理生成前脚本
                                                        jsCode.writeFile(source + "/before.js", `const getAllData = () => require('./data.json');const getAllFile = () => require('./file.json');` + '(function(){' + execute('geFileData', 'getBeforeShell', [data.id]) + '})();');
                                                        showToast('[info] 处理生成前脚本成功!');
                                                        // 处理生成后脚本
                                                        jsCode.writeFile(source + "/after.js", `const getAllData = () => require('./data.json');const getAllFile = () => require('./file.json');` + '(function(){' + execute('geFileData', 'getShell', [data.id]) + '})();');
                                                        showToast('[info] 处理生成后脚本成功!');
                                                        // 处理渲染模板
                                                        jsCode.writeFile(source + "/template.json", JSON.stringify(templates, null, "\t"));
                                                        showToast('[info] 处理需渲染的模板成功!');
                                                        // 处理执行脚本
                                                        const codeConfig = execute('controlData', 'getCodeConfig', [data.id]);
                                                        const im = [], keys = [], runs = [], cache = {};
                                                        const path = require('path');
                                                        codeConfig.forEach((c, i) => {
                                                            if (c.script) {
                                                                const script = c.script.trim().replace(/"/g, "'").match(/\'(.*)\'/);
                                                                if (script instanceof Array && script.length > 0) {
                                                                    cache[c.label] = true;
                                                                    keys.push(`'${c.label}'`);
                                                                    im.push(`const run_func_${i} = require("./jscode/${path.basename(script[1])}");`);
                                                                    runs.push(`typeof run_func_${i} == 'function'? run_func_${i}(): run_func_${i}`);
                                                                }
                                                            }
                                                        });
                                                        const ctrlAll = execute('controlData', 'getExtByPid', [data.id]),
                                                            inputs = [];
                                                        ctrlAll.forEach(c => {
                                                            console.log(c);
                                                            if (c.type == 'text' || c.type == 'textarea' || c.type == 'folder' || c.type == 'file') {
                                                                if (cache[c.label] != true) {
                                                                    inputs.push(`'${c.label}'`);
                                                                }
                                                            }
                                                        });
                                                        const t = require('app-root-path').path + '/help/template/';
                                                        const indexData = {
                                                            req: im.join('\n    '),
                                                            runs: runs.join(',\n        '),
                                                            keys: keys.join(','),
                                                            input: inputs.join(',')
                                                        };
                                                        const tplIndex = swig.compile(utils.readFile(t + 'index.txt'));
                                                        const indexJs = tplIndex(indexData);
                                                        jsCode.writeFile(source + "/index.js", indexJs.trim());
                                                        showToast('[info] 处理生成脚本成功!');
                                                        // 生成执行模板记录
                                                        const runJs = utils.readFile(t + 'runStart.js') + `\n${execute('geFileData', 'getSwig', [data.id])}\n` + utils.readFile(t + 'runEnd.js');
                                                        jsCode.writeFile(source + "/run.js", runJs.trim());
                                                        that.downloadPkg('node_modules', source).then(r => {
                                                            if (r) {
                                                                btn.up('window').unmask();
                                                                btn.up('window').close();
                                                                showToast(`[success] 导出成功,路径为:[${source}]!`);
                                                            }
                                                        });
                                                    }, 10);
                                                } else {
                                                    Ext.toast({
                                                        html: `<span style="color: red">请保证导出位置和平台已经填写或勾选!</span>`,
                                                        closable: false,
                                                        align: 't',
                                                        slideInDuration: 400
                                                    });
                                                }
                                            }
                                        }
                                    ]
                                }).show().focus();
                            }
                        }, '-', {
                            xtype: 'button',
                            text: '上传',
                            handler: function (btn) {
                                const d = btn.up().getWidgetRecord().getData();
                                const auth = execute('userConfig', 'getAuth');
                                if (auth.trim() == "") {
                                    login();
                                } else {
                                    const data = {id: d.id, text: d.text + '-' + utils.getNowTimeCode()};
                                    Ext.Ajax.request({
                                        url: execute('userConfig', 'getUrl') + '/auth',
                                        method: 'POST',
                                        headers: {
                                            "Authorization": "Bearer " + execute('userConfig', 'getAuth')
                                        },
                                        success: function (response) {

                                        },
                                        failure: function (response) {
                                            if (response.status == 401) {
                                                login(t => {
                                                    token = t;
                                                });
                                            } else {
                                                console.error(response);
                                                Ext.MessageBox.show({
                                                    title: '错误',
                                                    msg: '系统错误,请查看日志!',
                                                    buttons: Ext.MessageBox.OK,
                                                    icon: Ext.MessageBox.ERROR
                                                });
                                            }
                                        }
                                    });
                                    data.folder = require('../service/utils/help').getDataPath();
                                    Ext.create('Ext.window.Window', {
                                        title: '模板说明',
                                        width: '85%',
                                        height: '85%',
                                        layout: 'fit',
                                        resizable: true,
                                        maximizable: true,
                                        constrain: true,
                                        animateTarget: btn,
                                        modal: true,
                                        items: [{
                                            xtype: 'htmleditor'
                                        }],
                                        buttons: [
                                            {
                                                text: '上传',
                                                handler: function (btn) {
                                                    Ext.MessageBox.show({
                                                        title: '提示',
                                                        width: 300,
                                                        msg: '是否要将其设为私有模板(只有拥有您的授权码才能下载)?',
                                                        animateTarget: btn,
                                                        icon: Ext.MessageBox.QUESTION,
                                                        buttons: Ext.MessageBox.YESNO,
                                                        scope: this,
                                                        fn: function (pri) {
                                                            const v = btn.up('window').down('htmleditor').getValue();
                                                            btn.up('window').close();
                                                            Ext.getCmp('main-content').mask('上传中,请稍等...');
                                                            jsCode.exportModule(data).then(t => {
                                                                const file = data.folder + data.text + '.zip';
                                                                const param = {info: v, name: d.text, private: pri};
                                                                utils.uploadFile(file, file, param, token).then(c => {
                                                                    showToast('[success] ' + data.text + ' ' + c.message);
                                                                    if (c.serveId) {
                                                                        execute('parentData', 'updateTemplate', [d.id, c.serveId, c.detailId]);
                                                                    }
                                                                    jsCode.deleteFile(file);
                                                                    Ext.getCmp('main-content').unmask();
                                                                }).catch(() => {
                                                                    Ext.getCmp('main-content').unmask();
                                                                    jsCode.deleteFile(file);
                                                                    Ext.MessageBox.show({
                                                                        title: '错误',
                                                                        msg: '系统错误,请查看日志!',
                                                                        buttons: Ext.MessageBox.OK,
                                                                        icon: Ext.MessageBox.ERROR
                                                                    });
                                                                });
                                                            }).catch(err => {
                                                                console.error(err);
                                                                showError(err);
                                                                Ext.getCmp('main-content').unmask();
                                                                Ext.MessageBox.show({
                                                                    title: '错误',
                                                                    msg: '系统错误,请查看日志!',
                                                                    buttons: Ext.MessageBox.OK,
                                                                    icon: Ext.MessageBox.ERROR
                                                                });
                                                            });
                                                        }
                                                    }).focus();
                                                }
                                            }
                                        ]
                                    }).show().focus();
                                }
                            }
                        }, '-', {
                            xtype: 'button',
                            text: '删除',
                            handler: function (btn) {
                                const data = btn.up().getWidgetRecord().getData();
                                let msg = `是否删除模板[${data.text}]?`, flag = false;
                                if (data.id == pId) {
                                    flag = true;
                                    msg = `删除当前模板[${data.text}]系统会重新启动,是否继续?`;
                                }
                                showConfirm(msg, function (text) {
                                    const el = btn.up('templet').getEl();
                                    el.mask('处理中...');
                                    jsCode.removeModule(data.id).then(() => {
                                        btn.up('templet').getStore().setData(execute('parentData', 'getAll'));
                                        ipcRenderer.send('runCode', {type: 'refreshFile'});
                                        if (flag) {
                                            execute('history', 'setMode', ['']);
                                            execute('history', 'removeAll');
                                            el.unmask();
                                            const {app} = require('electron').remote;
                                            app.relaunch();
                                            app.exit(0);
                                        } else {
                                            el.unmask();
                                            showToast(`[success] 模板[${data.text}]删除成功!`);
                                        }
                                    });
                                }, null, Ext.MessageBox.ERROR);
                            }
                        }
                    ]
                }
            }
        ];
        this.callParent(arguments);
    },
    downloadPkg(file, target) {
        return new Promise((resolve) => {
            utils.downloadFile(file + '.zip', file + '.zip', `https://gitee.com/onioncssjs/GenerateTool/raw/master/${file}.zip`).then(d => {
                utils.unZipFile(d, {}, target).then(f => {
                    if (f) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
            }).catch(err => {
                resolve(false);
                Ext.toast({
                    html: `<span style="color: red">下载出错,请检查网络后重新尝试!</span>`,
                    closable: false,
                    align: 't',
                    slideInDuration: 400
                });
            });
        });
    }
});
