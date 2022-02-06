const ipcRenderer = require('electron').ipcRenderer;
const jsCode = require('../service/utils/JscodeUtil');
const swig = require('swig');
const utils = require('../service/utils/utils');
const command = require('../service/utils/commands');
let globalInterval;

swig.setDefaults({autoescape: false});

let threadIndex = 0;

function execute(key, method, args) {
    if (args === undefined) {
        args = [];
    }
    return ipcRenderer.sendSync('run', {key: key, method: method, args: args});
}

function runMethod(key, method, args) {
    threadIndex++;
    if (args === undefined) {
        args = [];
    }
    ipcRenderer.send('runServe', {thread: 'method-' + threadIndex, key: key, method: method, args: args});
    return new Promise((resolve, reject) => {
        ipcRenderer.once('method-' + threadIndex + '-reply', (event, data) => {
            ipcRenderer.removeAllListeners('method-' + threadIndex + '-reply');
            if (data.success) {
                resolve(data.data);
            } else {
                reject(data.data);
            }
        });
    })
}

function executeCache(method, args) {
    if (args === undefined) {
        args = [];
    }
    return ipcRenderer.sendSync('runCache', {method: method, args: args});
}

let title = '数据模板';
let consoleShowFlag = false;
let pId = executeCache('getCache', ['historyId']);
global.data['historyId'] = pId;
const controllers = {
    'mode': ['OnionSpace.view.minicode.minicode', 'OnionSpace.view.mode.mode'],
    'editor': ['OnionSpace.controller.Editor'],
    'code': ['OnionSpace.view.code.code'],
    'pkg': ['OnionSpace.view.pkg.pkg'],
    'unpkg': ['OnionSpace.view.unpkg.unpkg'],
    'minicode': ['OnionSpace.view.minicode.minicode'],
    'diffcode': ['OnionSpace.view.diffcode.diffcode'],
    'welcome': ['OnionSpace.controller.Welcome'],
    'help': ['OnionSpace.view.help.help'],
    'generate': ['OnionSpace.view.minicode.minicode', 'OnionSpace.view.diffcode.diffcode', 'OnionSpace.view.generate.generate'],
    'templet': ['OnionSpace.view.templet.templet'],
    'online-temp': ['OnionSpace.view.online-temp.online-temp'],
    'detail-temp': ['OnionSpace.view.detail-temp.detail-temp'],
    'swig-template': ['OnionSpace.view.minicode.minicode', 'OnionSpace.controller.SwigTemplate'],
    'setting': ['OnionSpace.controller.Setting'],
    'message': ['OnionSpace.controller.Message'],
    'after-shell': ['OnionSpace.view.minicode.minicode', 'OnionSpace.view.after-shell.after-shell'],
    'before-shell': ['OnionSpace.view.minicode.minicode', 'OnionSpace.view.before-shell.before-shell'],
    'logger': ['OnionSpace.controller.Logger'],
    'operation': ['OnionSpace.view.operation.operation']
};

ipcRenderer.send('loading-msg', '服务加载中...');

function initMainView() {
    Ext.application({
        requires: ['Ext.container.Viewport'],
        name: 'OnionSpace',
        appFolder: 'app',
        controllers: [
            'Statusbar',
            'Message'
        ],
        launch: function () {
            ipcRenderer.send('loading-msg', '模块加载中...');
            moduleId = pId;
            const datas = execute('data', 'getData', [pId]);
            datas.forEach(d => d.icon = './images/database_save.svg');
            let store = Ext.create('Ext.data.TreeStore', {
                root: {
                    expanded: true,
                    children: datas
                }
            });
            let fileStore = Ext.create('Ext.data.TreeStore', {
                root: {
                    expanded: true,
                    text: '',
                    children: []
                }
            });
            if (pId !== '') {
                title = execute('parentData', 'getById', [pId]).text;
                require('electron').remote.getCurrentWindow().setTitle(`代码构建工具[${title}]`);
            }

            ipcRenderer.send('loading-msg', '界面加载中...');
            const viewport = Ext.create('Ext.panel.Panel', {
                id: 'border-example',
                layout: 'border',
                bbar: {
                    id: 'msg-bar',
                    xtype: 'statusbar',
                    float: 'left',
                    toggle: true,
                    msg: true,
                    consoleFlagShow: false,
                    status: false,
                    flagShow: false,
                    flagInit: false,
                    list: [
                        {id: 'console-btn', img: './images/log.svg', name: 'Console'},
                        {id: 'terminal-btn', img: './images/terminal.svg', name: 'Terminal'}
                    ],
                    tool: {
                        id: 'run-code',
                        image: 'images/stop.svg',
                        style: 'display: none;',
                        title: '脚本进程已启动,点击可停止',
                        click: function (bar, dom) {
                            showConfirm("确认停止后台脚本进程吗?", function () {
                                closeNodeWin();
                                Ext.getCmp('msg-bar').closeProgress();
                                clearInterval(globalInterval);
                            }, dom);
                        }
                    },
                    click: function (t, dom, name) {
                        if (name == 'Console') {
                            consoleShowFlag = true;
                            Ext.getCmp('terminal').hide();
                            t.flagShow = false;
                            if (!t.consoleFlagShow) {
                                t.consoleFlagShow = true;
                                Ext.getCmp('console').show();
                            } else {
                                t.consoleFlagShow = false;
                                dom.className = "";
                                Ext.getCmp('console').hide();
                            }
                        } else {
                            t.consoleFlagShow = false;
                            Ext.getCmp('console').hide();
                            if (!t.status && !t.flagInit) {
                                t.status = true;
                                Ext.getCmp('terminal').show();
                                t.flagShow = true;
                                t.flagInit = true;
                                command.init(document.getElementById('term')).then((pty, xterm) => {
                                    t.status = false;
                                    const folder = jsCode.getFolder(pId);
                                    command.cdTargetFolder(folder);
                                });
                            } else {
                                if (t.flagShow) {
                                    Ext.getCmp('terminal').hide();
                                    dom.className = "";
                                    t.flagShow = false;
                                } else {
                                    Ext.getCmp('terminal').show();
                                    t.flagShow = true;
                                }
                            }
                        }
                    }
                },
                items: [
                    {
                        region: 'south',
                        split: true,
                        height: 100,
                        minSize: 100,
                        maxSize: 200,
                        collapsible: false,
                        collapsed: false,
                        id: 'terminal',
                        hidden: true,
                        margins: '0 0 0 0',
                        html: `<div style="background: transparent;overflow: hidden;" id="term"></div>`,
                        listeners: {
                            resize: function (el) {
                                document.getElementById('term').style.height = document.getElementById('terminal-body').style.height;
                                command.fitTerm();
                            }
                        },
                        tbar: {
                            xtype: 'statusbar',
                            pId: pId,
                            float: 'right',
                            list: [
                                {img: './images/stop.svg', name: 'Stop'},
                                {img: './images/delete.svg', name: 'Clear'}
                            ],
                            click: function (s, d, n) {
                                if (n == 'Clear') {
                                    command.clearTerm();
                                } else {
                                    command.cancelPty();
                                }
                            }
                        }
                    }, {
                        region: 'south',
                        split: true,
                        height: 100,
                        minSize: 100,
                        maxSize: 200,
                        collapsible: false,
                        collapsed: false,
                        id: 'console',
                        hidden: true,
                        margins: '0 0 0 0',
                        xtype: 'message',
                        tbar: {
                            xtype: 'statusbar',
                            pId: pId,
                            float: 'right',
                            list: [
                                {img: './images/delete.svg', name: 'Clear'}
                            ],
                            click: function (s, d, n) {
                                Ext.getCmp('console').clear();
                            }
                        }
                    }, {
                        region: 'center',
                        id: 'main-content',
                        layout: 'border',
                        items: [
                            {
                                region: 'west',
                                split: true,
                                width: 240,
                                minWidth: 160,
                                maxWidth: 400,
                                margins: '0 0 0 0',
                                hidden: true,
                                layout: 'accordion',
                                id: 'main-template',
                                items: [
                                    {
                                        xtype: 'treepanel',
                                        title: title,
                                        store: store,
                                        id: 'panel-model',
                                        listeners: {
                                            itemclick: function (node, event) {
                                                const item = event.data.id;
                                                const icon = event.data.icon;
                                                const title = event.data.text;
                                                addbutton(item, 'mode', './images/database_save.svg', title, {});
                                            },
                                            itemcontextmenu: function (node, record, item, index, event, eOpts) {
                                                new Ext.menu.Menu({
                                                    minWidth: 60,
                                                    items: [{
                                                        text: '删除',
                                                        icon: 'images/cross.svg',
                                                        handler: function () {
                                                            showConfirm(`是否删除模板[${record.data.text}]?`, function (text) {
                                                                execute('data', 'removeById', [record.data.id]);
                                                                store.setRoot({
                                                                    expanded: true,
                                                                    text: '',
                                                                    children: execute('data', 'getData', [pId])
                                                                });
                                                                Ext.getCmp('mainmenutab').remove(record.data.id);
                                                            }, this, Ext.MessageBox.ERROR);
                                                        }
                                                    }]
                                                }).showAt(event.getPoint());
                                            }
                                        },
                                        closable: false,
                                        rootVisible: false,
                                        hideCollapseTool: true,
                                        tools: [
                                            {
                                                id: 'main-change-module',
                                                qtip: '切换模板',
                                                renderTpl: [
                                                    '<div id="{id}-toolEl" class="x-tool-tool-el x-tool-img-tag" role="presentation"></div>'
                                                ],
                                                listeners: {
                                                    click: function () {
                                                        Ext.create('Ext.window.Window', {
                                                            title: '选择模板',
                                                            width: 300,
                                                            layout: 'fit',
                                                            fixed: true,
                                                            animateTarget: this,
                                                            resizable: false,
                                                            constrain: true,
                                                            modal: true,
                                                            items: {
                                                                xtype: 'combobox',
                                                                margin: '10',
                                                                store: {
                                                                    fields: ['id', 'text'],
                                                                    data: execute('parentData', 'getAll')
                                                                },
                                                                queryMode: 'local',
                                                                displayField: 'text',
                                                                valueField: 'id',
                                                                listeners: {
                                                                    afterrender: function (field) {
                                                                        Ext.defer(function () {
                                                                            field.focus(true, 100);
                                                                        }, 1);
                                                                    }
                                                                }
                                                            },
                                                            buttonAlign: 'center',
                                                            buttons: [{
                                                                text: '确定',
                                                                handler: function () {
                                                                    const combo = this.up('window').down('combobox');
                                                                    const row = combo.getSelectedRecord();
                                                                    if (row == null) {
                                                                        Ext.toast({
                                                                            html: `<span style="color: red;">请选择至少一条数据!</span>`,
                                                                            autoClose: true,
                                                                            align: 't',
                                                                            slideDUration: 400,
                                                                            maxWidth: 400
                                                                        });
                                                                        return;
                                                                    }
                                                                    this.up('window').close();
                                                                    changeTemplate(row.id);
                                                                }
                                                            }, {
                                                                text: '取消',
                                                                handler: function () {
                                                                    this.up('window').close();
                                                                }
                                                            }
                                                            ]
                                                        }).show().focus();
                                                    }
                                                }
                                            },
                                            {
                                                id: 'main-create-module',
                                                qtip: '新建模板',
                                                renderTpl: [
                                                    '<div id="{id}-toolEl" class="x-tool-tool-el x-tool-img-save" role="presentation"></div>'
                                                ],
                                                listeners: {
                                                    click: function () {
                                                        createTemplate(this);
                                                    }
                                                }
                                            },
                                            {
                                                qtip: '添加模板详情',
                                                renderTpl: [
                                                    '<div id="{id}-toolEl" class="x-tool-tool-el x-tool-img-add" role="presentation"></div>'
                                                ],
                                                listeners: {
                                                    click: function () {
                                                        if (pId == undefined || pId == null || pId.trim().length == 0) {
                                                            showToast('请先[选择模板]或[创建模板]!');
                                                            return;
                                                        }
                                                        const modes = execute('data', 'getData', [pId]);
                                                        Ext.create('Ext.window.Window', {
                                                            title: '模板详情名称',
                                                            fixed: true,
                                                            width: 300,
                                                            layout: 'fit',
                                                            animateTarget: this,
                                                            resizable: false,
                                                            constrain: true,
                                                            modal: true,
                                                            items: {
                                                                xtype: 'combobox',
                                                                margin: '10',
                                                                store: {
                                                                    fields: ['id', 'text'],
                                                                    data: modes
                                                                },
                                                                queryMode: 'local',
                                                                displayField: 'text',
                                                                valueField: 'id'
                                                            },
                                                            buttonAlign: 'center',
                                                            buttons: [{
                                                                text: '确定',
                                                                handler: function () {
                                                                    const combo = this.up('window').down('combobox');
                                                                    const t = combo.getRawValue();
                                                                    if (utils.isEmpty(t)) {
                                                                        Ext.toast({
                                                                            html: `<span style="color: red;">请输入名称!</span>`,
                                                                            autoClose: true,
                                                                            align: 't',
                                                                            slideDUration: 400,
                                                                            maxWidth: 400
                                                                        });
                                                                        return;
                                                                    }
                                                                    let ifAdd = true;
                                                                    modes.forEach(function (m) {
                                                                        if (m.text == t) {
                                                                            ifAdd = false;
                                                                        }
                                                                    });
                                                                    if (ifAdd) {
                                                                        execute('data', 'setData', [t, pId]);
                                                                    }
                                                                    this.up('window').close();
                                                                    const root = Ext.getCmp('panel-model').getRootNode();
                                                                    root.removeAll();
                                                                    const list = execute('data', 'getData', [pId]);
                                                                    list.forEach(d => d.icon = './images/database_save.svg');
                                                                    root.appendChild(list);
                                                                }
                                                            }, {
                                                                text: '取消',
                                                                handler: function () {
                                                                    this.up('window').close();
                                                                }
                                                            }]
                                                        }).show().focus();
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        xtype: 'treepanel',
                                        title: '生成模板',
                                        store: fileStore,
                                        id: 'ge-tree',
                                        split: true,
                                        useArrows: true,
                                        viewConfig: {
                                            plugins: [{
                                                ptype: 'treeviewdragdrop',
                                                appendOnly: true
                                            }],
                                            listeners: {
                                                drop: function (node, data, overModel, dropPosition) {
                                                    const paId = data.records[0].parentNode.data.id;
                                                    const id = data.records[0].data.id;
                                                    execute('fileData', 'updateRootId', [id, paId]);
                                                }
                                            }
                                        },
                                        listeners: {
                                            beforeitemexpand: function (node, index, item, eOpts) {
                                                node.data.icon = './icons/folder-core-open.svg';
                                            },
                                            beforeitemcollapse: function (node, index, item, eOpts) {
                                                node.data.icon = './icons/folder-core.svg';
                                            },
                                            itemdblclick: function (node, event) {
                                                const item = event.data.id;
                                                const icon = event.data.icon;
                                                const title = event.data.text;
                                                const type = event.data.type;
                                                if (type == 'file' && event.childNodes.length == 0) {
                                                    addbutton(item, 'generate', getFileIcon(title), title, {
                                                        updateType: event.get('updateType'),
                                                        path: event.get('folder') + '\\' + title,
                                                        folder: event.get('folder'),
                                                        file: title,
                                                        fileId: event.get('id')
                                                    });
                                                }
                                            },
                                            afteritemexpand: function (node, index, item, eOpts) {
                                                node.removeAll();
                                                const child = execute('fileData', 'getFiles', [pId, node.data.id]);
                                                child.forEach(d => {
                                                    d.children = undefined;
                                                    d.loaded = false;
                                                    d.expanded = false;
                                                    if (d.type == 'file') {
                                                        d.icon = getFileIcon(d.text);
                                                    } else {
                                                        d.icon = './icons/folder-core.svg';
                                                    }
                                                });
                                                node.appendChild(child);
                                                Ext.get(item).select('.x-tree-elbow-img').last().addCls('x-tree-expander')
                                            },
                                            itemcontextmenu: function (node, record, item, index, event, eOpts) {
                                                const {
                                                    type,
                                                    id,
                                                    text
                                                } = record.data;
                                                new Ext.menu.Menu({
                                                    minWidth: 60,
                                                    items: [
                                                        {
                                                            text: '添加模板文件',
                                                            icon: 'images/add-file.svg',
                                                            hidden: type != 'file' ? false : true,
                                                            handler: function () {
                                                                Ext.create('Ext.window.Window', {
                                                                    title: '模板文件',
                                                                    fixed: true,
                                                                    animateTarget: item,
                                                                    width: 280,
                                                                    layout: 'fit',
                                                                    resizable: false,
                                                                    constrain: true,
                                                                    modal: true,
                                                                    items: {
                                                                        xtype: 'form',
                                                                        layout: {
                                                                            type: 'vbox',
                                                                            pack: 'start',
                                                                            align: 'stretch'
                                                                        },
                                                                        items: [{
                                                                            xtype: 'textfield',
                                                                            fieldLabel: '名称',
                                                                            margin: '10',
                                                                            labelWidth: 45,
                                                                            name: 'name',
                                                                            listeners: {
                                                                                afterrender: function (field) {
                                                                                    Ext.defer(function () {
                                                                                        field.focus(true, 100);
                                                                                    }, 1);
                                                                                }
                                                                            }
                                                                        },
                                                                            {
                                                                                xtype: 'radiogroup',
                                                                                fieldLabel: '类型',
                                                                                margin: '10',
                                                                                labelWidth: 45,
                                                                                name: 'type',
                                                                                items: [{
                                                                                    boxLabel: '添加',
                                                                                    inputValue: 'add',
                                                                                    checked: true
                                                                                },
                                                                                    {
                                                                                        boxLabel: '修改',
                                                                                        inputValue: 'update'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        ]
                                                                    },
                                                                    buttonAlign: 'center',
                                                                    buttons: [{
                                                                        text: '确定',
                                                                        handler: function () {
                                                                            const form = this.up('window').down('form').getForm();
                                                                            if (form.isValid()) {
                                                                                let {
                                                                                    name,
                                                                                    type
                                                                                } = form.getValues();
                                                                                if (type == 'update') {
                                                                                    name = name + '.js';
                                                                                }
                                                                                const data = {
                                                                                    text: name,
                                                                                    type: 'file',
                                                                                    leaf: true,
                                                                                    parentFolder: text,
                                                                                    rootId: id,
                                                                                    cls: type == 'update' ? 'color-blue' : '',
                                                                                    updateType: type,
                                                                                    pId: pId
                                                                                };
                                                                                const child = execute('fileData', 'saveOrUpdate', [data]);
                                                                                execute('geFileData', 'save', [child.id, pId]);
                                                                                child.icon = getFileIcon(name);
                                                                                record.appendChild(child);
                                                                                this.up('window').close();
                                                                            }
                                                                        }
                                                                    },
                                                                        {
                                                                            text: '取消',
                                                                            handler: function () {
                                                                                this.up('window').close();
                                                                            }
                                                                        }
                                                                    ]
                                                                }).show().focus();
                                                            }
                                                        },
                                                        {
                                                            text: '添加模板文件夹',
                                                            icon: 'images/folder_add.svg',
                                                            hidden: type != 'file' ? false : true,
                                                            handler: function () {
                                                                showPrompt('模板文件夹', '', function (val) {
                                                                    const data = {
                                                                        text: val,
                                                                        type: 'folder',
                                                                        folder: true,
                                                                        parentFolder: text,
                                                                        rootId: id,
                                                                        pId: pId
                                                                    };
                                                                    const child = execute('fileData', 'saveOrUpdate', [data]);
                                                                    child.icon = './icons/folder-core.svg';
                                                                    record.appendChild(child);
                                                                }, item);
                                                            }
                                                        },
                                                        {
                                                            text: '设置生成路径',
                                                            hidden: type == 'file' ? false : true,
                                                            icon: 'images/set-file.svg',
                                                            handler: function () {
                                                                const {
                                                                    file
                                                                } = execute('geFileData', 'getOneData', [record.get('id')]);
                                                                const fileTpl = swig.compile(file);
                                                                const fileOutput = fileTpl(execute('controlData', 'getModuleData', [pId]));
                                                                Ext.create('Ext.window.Window', {
                                                                    title: '设置路径',
                                                                    fixed: true,
                                                                    animateTarget: item,
                                                                    width: 500,
                                                                    layout: 'fit',
                                                                    resizable: false,
                                                                    constrain: true,
                                                                    modal: true,
                                                                    items: {
                                                                        xtype: 'form',
                                                                        layout: {
                                                                            type: 'vbox',
                                                                            pack: 'start',
                                                                            align: 'stretch'
                                                                        },
                                                                        items: [
                                                                            {
                                                                                xtype: 'textareafield',
                                                                                fieldLabel: '文件',
                                                                                margin: '10',
                                                                                emptyText: '如:{{folder}}/{{file.mapper}}',
                                                                                labelWidth: 45,
                                                                                name: 'file',
                                                                                labelAlign: 'right',
                                                                                allowBlank: false,
                                                                                value: file,
                                                                                listeners: {
                                                                                    change: function (dom, val) {
                                                                                        let output = val;
                                                                                        try {
                                                                                            const tpl = swig.compile(val);
                                                                                            output = tpl(execute('controlData', 'getModuleData', [pId]));
                                                                                        } catch (e) {
                                                                                            console.error(e);
                                                                                        }
                                                                                        Ext.getCmp('file-preview').setValue(output);
                                                                                    }
                                                                                }
                                                                            },
                                                                            {
                                                                                xtype: 'textareafield',
                                                                                fieldLabel: '预览',
                                                                                margin: '10',
                                                                                labelAlign: 'right',
                                                                                readOnly: true,
                                                                                labelWidth: 45,
                                                                                id: 'file-preview',
                                                                                value: fileOutput
                                                                            }
                                                                        ]
                                                                    },
                                                                    buttonAlign: 'center',
                                                                    buttons: [{
                                                                        text: '确定',
                                                                        handler: function () {
                                                                            const form = this.up('window').down('form').getForm();
                                                                            if (form.isValid()) {
                                                                                const d = form.getValues();
                                                                                execute('geFileData', 'updateDataFile', [record.get('id'), d.file]);
                                                                                this.up('window').close();
                                                                            }
                                                                        }
                                                                    },
                                                                        {
                                                                            text: '取消',
                                                                            handler: function () {
                                                                                this.up('window').close();
                                                                            }
                                                                        }
                                                                    ]
                                                                }).show().focus();
                                                            }
                                                        },
                                                        {
                                                            text: '重命名',
                                                            icon: 'images/edit.svg',
                                                            handler: function () {
                                                                showPrompt('新名称', '', function (val) {
                                                                    if (val.trim().length > 0) {
                                                                        const child = {...record.data};
                                                                        Ext.getCmp('mainmenutab').remove(record.get('id'));
                                                                        execute('fileData', 'updateName', [record.get('id'), val]);
                                                                        child.text = val;
                                                                        child.icon = getFileIcon(val);
                                                                        record.parentNode.replaceChild(child, record);
                                                                    }
                                                                }, item, text);
                                                            }
                                                        },
                                                        {
                                                            text: '删除',
                                                            icon: 'images/cross.svg',
                                                            handler: function () {
                                                                showConfirm(`是否删除[${record.data.text}]?`, function (text) {
                                                                    record.parentNode.removeChild(record);
                                                                    const rId = record.get('id');
                                                                    execute('fileData', 'removeFile', [rId]);
                                                                    execute('geFileData', 'removeData', [rId]);
                                                                    Ext.getCmp('mainmenutab').remove(rId);
                                                                    const removeList = execute('fileData', 'getTreeData', [rId, pId]);
                                                                    removeList.forEach(r => {
                                                                        execute('fileData', 'removeFile', [r.id]);
                                                                        execute('geFileData', 'removeData', [r.id]);
                                                                        Ext.getCmp('mainmenutab').remove(r.id);
                                                                    });
                                                                }, item, Ext.MessageBox.ERROR);
                                                            }
                                                        }
                                                    ]
                                                }).showAt(event.getPoint());
                                            }
                                        },
                                        hideCollapseTool: true,
                                        closable: false,
                                        checkPropagation: 'both',
                                        useArrows: true,
                                        rootVisible: false,
                                        tools: [
                                            {
                                                renderTpl: [
                                                    '<div id="{id}-toolEl" class="x-tool-tool-el x-tool-img-add-file" role="presentation"></div>'
                                                ],
                                                qtip: '添加模板文件',
                                                listeners: {
                                                    click: function () {
                                                        if (pId == undefined || pId == null || pId.trim().length == 0) {
                                                            showToast('请先[选择模板]或[创建模板]!');
                                                            return;
                                                        }
                                                        setGeFile(this);
                                                    }
                                                }
                                            },
                                            {
                                                renderTpl: [
                                                    '<div id="{id}-toolEl" class="x-tool-tool-el x-tool-img-add-folder" role="presentation"></div>'
                                                ],
                                                qtip: '添加模板文件夹',
                                                listeners: {
                                                    click: function () {
                                                        if (pId == undefined || pId == null || pId.trim().length == 0) {
                                                            showToast('请先[选择模板]或[创建模板]!');
                                                            return;
                                                        }
                                                        setGeFolder(this);
                                                    }
                                                }
                                            },
                                            {
                                                renderTpl: [
                                                    '<div id="{id}-toolEl" class="x-tool-tool-el x-tool-img-cd-go" role="presentation"></div>'
                                                ],
                                                qtip: '开始创建(F5)',
                                                id: 'create-btn',
                                                listeners: {
                                                    click: function () {
                                                        createFile(this);
                                                    }
                                                }
                                            },
                                            {
                                                renderTpl: [
                                                    '<div id="{id}-toolEl" class="x-tool-tool-el x-tool-img-more" role="presentation"></div>'
                                                ],
                                                qtip: '其它配置',
                                                listeners: {
                                                    click: function (btn, e) {
                                                        new Ext.menu.Menu({
                                                            minWidth: 60,
                                                            items: [
                                                                {
                                                                    text: '配置swig',
                                                                    icon: 'images/template.svg',
                                                                    handler: function () {
                                                                        if (pId == undefined || pId == null || pId.trim().length == 0) {
                                                                            showToast('请先[选择模板]或[创建模板]!');
                                                                            return;
                                                                        }
                                                                        addbutton('swig-template', 'swig-template', './images/template.svg', 'Swig配置', {});
                                                                    }
                                                                },
                                                                {
                                                                    text: '生成前脚本',
                                                                    icon: 'images/before.svg',
                                                                    handler: function () {
                                                                        if (pId == undefined || pId == null || pId.trim().length == 0) {
                                                                            showToast('请先[选择模板]或[创建模板]!');
                                                                            return;
                                                                        }
                                                                        addbutton('before-shell', 'before-shell', './images/before.svg', '生成前脚本', {pId: pId});
                                                                    }
                                                                },
                                                                {
                                                                    text: '生成后脚本',
                                                                    icon: 'images/after.svg',
                                                                    handler: function () {
                                                                        if (pId == undefined || pId == null || pId.trim().length == 0) {
                                                                            showToast('请先[选择模板]或[创建模板]!');
                                                                            return;
                                                                        }
                                                                        addbutton('after-shell', 'after-shell', './images/after.svg', '生成后脚本', {pId: pId});
                                                                    }
                                                                }
                                                            ]
                                                        }).showAt(e.getPoint());
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                region: 'west',
                                split: true,
                                width: 240,
                                minWidth: 160,
                                maxWidth: 400,
                                id: 'js-data',
                                useArrows: true,
                                hidden: true,
                                scrollable: true,
                                layout: 'fit'
                            },
                            {
                                region: 'center',
                                xtype: 'tabpanel',
                                fullscreen: true,
                                id: 'mainmenutab',
                                plugins: new Ext.ux.TabCloseMenu(),
                                items: [],
                                listeners: {
                                    tabchange: function (tabPanel, tab) {
                                        execute('history', 'setShowTab', [tab.id]);
                                        labelEditor.cancelEdit();
                                    },
                                    add: function (tabPanel, tab) {
                                        if (tab.initialConfig.useType != 'editor') {
                                            execute('history', 'setTab', [{
                                                id: tab.config.id,
                                                params: tab.config.params,
                                                title: tab.config.title,
                                                type: tab.config.xtype,
                                                icon: tab.config.icon,
                                                modeId: pId
                                            }]);
                                        }
                                    },
                                    remove: function (tabPanel, tab) {
                                        if (tab.initialConfig.useType == 'editor') {
                                            execute('history', 'removeCodeTab', [tab.config.id]);
                                        } else {
                                            execute('history', 'removeTab', [tab.config.id]);
                                        }
                                        labelEditor.cancelEdit();
                                    }
                                }
                            }
                        ]
                    }],
                dockedItems: [
                    {
                        id: 'left-bar',
                        dock: 'left',
                        xtype: 'statusbar',
                        float: 'left',
                        toggle: true,
                        jsShow: false,
                        templateShow: false,
                        type: 'vertical',
                        param: 119,
                        list: [
                            {img: './images/tab-script.svg', name: 'JS脚本'},
                            {img: './images/tab-template.svg', name: '模板'}
                        ],
                        click: function (t, dom, name) {
                            if (name == 'JS脚本') {
                                if (t.jsShow) {
                                    Ext.getCmp('js-data').hide();
                                    dom.className = "";
                                } else {
                                    Ext.getCmp('main-template').hide();
                                    Ext.getCmp('js-data').show();
                                    t.templateShow = false;
                                }
                                t.jsShow = !t.jsShow;
                            } else {
                                if (t.templateShow) {
                                    Ext.getCmp('main-template').hide();
                                    dom.className = "";
                                } else {
                                    Ext.getCmp('js-data').hide();
                                    Ext.getCmp('main-template').show();
                                    t.jsShow = false;
                                }
                                t.templateShow = !t.templateShow;
                            }
                        }
                    }
                ]
            });

            Ext.create('Ext.Viewport', {
                layout: 'fit',
                items: viewport
            });
            ipcRenderer.send('loading-msg', '缓存加载中...');

            getFilesData();

            function addbutton(item, url, icon, title, data) {
                const panel = "mainmenutab";
                const tabPanel = Ext.getCmp(panel);
                const taa = Ext.getCmp(item);
                if (taa) {
                    tabPanel.setActiveTab(taa);
                } else {
                    tabPanel.mask('加载中...');
                    Ext.require(controllers[url], function () {
                        tabPanel.unmask();
                        const tab = tabPanel.add({
                            id: item,
                            pId: pId,
                            title: title,
                            icon: icon,
                            closable: true,
                            params: data,
                            xtype: url
                        });
                        tabPanel.setActiveTab(tab);
                    });
                }
            }

            function setGeFile(btn, id) {
                let d = {};
                if (id != undefined) {
                    d = execute('fileData', 'getFile', [id]);
                }
                const tree = btn.up('treepanel');
                const root = tree.getRootNode();
                Ext.create('Ext.window.Window', {
                    title: '模板文件',
                    fixed: true,
                    animateTarget: btn,
                    width: 280,
                    layout: 'fit',
                    resizable: false,
                    constrain: true,
                    modal: true,
                    items: {
                        xtype: 'form',
                        layout: {
                            type: 'vbox',
                            pack: 'start',
                            align: 'stretch'
                        },
                        items: [
                            {
                                xtype: 'textfield',
                                fieldLabel: '名称',
                                margin: '10',
                                labelWidth: 45,
                                name: 'name',
                                listeners: {
                                    afterrender: function (field) {
                                        Ext.defer(function () {
                                            field.focus(true, 100);
                                        }, 1);
                                    }
                                }
                            },
                            {
                                xtype: 'radiogroup',
                                fieldLabel: '类型',
                                margin: '10',
                                labelWidth: 45,
                                name: 'type',
                                items: [
                                    {boxLabel: '添加', inputValue: 'add', checked: true},
                                    {boxLabel: '修改', inputValue: 'update'}
                                ]
                            }
                        ]
                    },
                    buttonAlign: 'center',
                    buttons: [
                        {
                            text: '确定', handler: function () {
                                const form = this.up('window').down('form').getForm();
                                if (form.isValid()) {
                                    let {name, type} = form.getValues();
                                    if (type == 'update') {
                                        name = name + '.js';
                                    }
                                    const data = {
                                        text: name,
                                        type: 'file',
                                        leaf: true,
                                        parentFolder: '',
                                        rootId: '0',
                                        cls: type == 'update' ? 'color-blue' : '',
                                        updateType: type,
                                        pId: pId
                                    };
                                    const child = execute('fileData', 'saveOrUpdate', [data, id]);
                                    execute('geFileData', 'save', [child.id, pId]);
                                    child.icon = getFileIcon(name);
                                    root.appendChild(child);
                                    this.up('window').close();
                                }
                            }
                        },
                        {
                            text: '取消', handler: function () {
                                this.up('window').close();
                            }
                        }
                    ]
                }).show().focus();
            }

            function setGeFolder(btn, id) {
                let d = {};
                if (id != undefined) {
                    d = execute('fileData', 'getFile', [id]);
                }
                const tree = btn.up('treepanel');
                const root = tree.getRootNode();
                showPrompt('模板文件夹', '', function (text) {
                    const data = {
                        text: text,
                        type: 'folder',
                        folder: true,
                        parentFolder: '',
                        rootId: '0',
                        pId: pId
                    };
                    const child = execute('fileData', 'saveOrUpdate', [data, id]);
                    child.icon = './icons/folder-core.svg';
                    root.appendChild(child);
                }, btn, d.text);
            }

            setJsData();

            try {
                eval(execute('geFileData', 'getSwig', [pId]));
            } catch (e) {
                console.error(e);
                showError(e);
            }
            ipcRenderer.send('loading-msg', '历史加载中...');
            const tabData = execute('history', 'getTab', [pId]);
            const tabCode = execute('history', 'getCode');
            const showTab = execute('history', 'getShowTab');
            if (pId !== '') {
                for (let i = 0; i < tabData.length; i++) {
                    if (tabData[i].id == showTab) {
                        openSome(tabData[i]);
                    } else {
                        openSome(tabData[i], true);
                    }
                }
                for (let i = 0; i < tabCode.length; i++) {
                    if (tabCode[i].id == showTab) {
                        openCode(tabCode[i]);
                    } else {
                        openCode(tabCode[i], false);
                    }
                }
            }
            registerAllSuggestion();
            checkNew(pId);
            const font = execute('userConfig', 'getConfig', ['font']),
                fontSize = execute('userConfig', 'getConfig', ['fontSize']);
            if (font != null && font != 'default') {
                let node = document.createElement('style');
                node.id = "font-style";
                node.innerHTML = `*:not(.font-part) {font-family: '${font}',Consolas, "Courier New", monospace}`;
                document.getElementsByTagName('head')[0].appendChild(node);
            }
            if (fontSize != null) {
                const id = "font-size";
                let node = document.getElementById(id);
                if (node == null) node = document.createElement('style');
                node.id = id;
                node.innerHTML = `* {font-size: ${fontSize}px;}`;
                document.getElementsByTagName('head')[0].appendChild(node);
            }
            document.body.style.backgroundImage = `url('${execute('userConfig', 'getBg').replace(/\\/g, '/')}')`;
            document.body.style.backgroundPosition = 'center center !important';
            document.body.style.backgroundRepeat = 'no-repeat no-repeat';
            document.body.style.backgroundSize = 'cover';
            document.body.style.opacity = execute('userConfig', 'getOpacity');
            const t = execute('systemConfig', 'getTheme');
            Ext.theme.Material.setDarkMode(t == 'dark' ? true : false);
            monaco.editor.setTheme(t == 'dark' ? 'darkTheme' : 'lightTheme');
            const color = execute('systemConfig', 'getConfig', ['color']);
            if (color) {
                document.body.style = `${document.body.attributes['style'].value};--base-color:#${color};--selected-background-color:#${color};`;
            } else {
                try {
                    const t = require('windows-titlebar-color');
                    let titlebarColor = t.titlebarColor;
                    if(titlebarColor == 'white' || titlebarColor == '#ffffff') {
                        titlebarColor = '#287bcf';
                    }
                    document.body.style = `${document.body.attributes['style'].value};--base-color:${titlebarColor};--selected-background-color:#${titlebarColor};`;
                    execute('systemConfig', 'setConfig', ['color', titlebarColor.replace('#', '')]);
                } catch (e) {
                    console.error(e);
                }
            }
            ipcRenderer.send('loading-success', '加载完成!');
            checkVersion();
            setDefaultUrl();
        }
    });
}

function checkVersion() {
    const v = execute('systemConfig', 'getConfig', ['version']), nV = utils.getVersion();
    if (v == nV) {
        return;
    }
    execute('systemConfig', 'setConfig', ['version', nV]);
    openSome({id: 'welcome', title: '更新日志', type: 'welcome'});
}

function setJsData() {
    if (pId == undefined || pId == null || pId.trim().length == 0) {
        showToast('请先[选择模板]或[创建模板]!');
        return;
    }
    const main = Ext.getCmp('js-data');
    main.removeAll(true);
    Ext.require(controllers['editor'], function () {
        main.add({
            xtype: 'editor',
            pId: pId
        });
    });
}

function getFilesData() {
    let GfData = execute('fileData', 'getFiles', [pId, '0']);
    GfData.forEach(d => {
        d.children = undefined;
        d.loaded = false;
        d.expanded = false;
        if (d.type == 'file') {
            d.icon = getFileIcon(d.text);
        } else {
            d.icon = './icons/folder-core.svg';
        }
    });
    const root = Ext.getCmp('ge-tree').getRootNode();
    root.removeAll();
    root.appendChild(GfData);
}

function openSome({id, title, type, params, icon}, flag) {
    const panel = "mainmenutab";
    const tabPanel = Ext.getCmp(panel);
    const taa = Ext.getCmp(id);
    if (taa) {
        tabPanel.setActiveTab(taa);
    } else {
        tabPanel.mask('加载中...');
        Ext.require(controllers[type], function () {
            tabPanel.unmask();
            const tab = tabPanel.add({
                id: id,
                title: title,
                pId: pId,
                closable: true,
                icon: icon,
                params: params,
                xtype: type
            });
            if (flag === undefined) {
                tabPanel.setActiveTab(tab);
            }
        });
    }
}

function openCode(code, flag) {
    const panel = "mainmenutab";
    const tabPanel = Ext.getCmp(panel);
    const taa = Ext.getCmp(code.id);
    if (taa) {
        tabPanel.setActiveTab(taa);
    } else {
        tabPanel.mask('加载中...');
        Ext.require(controllers[code.xtype], function () {
            tabPanel.unmask();
            const tab = tabPanel.add(code);
            if (flag === undefined) {
                tabPanel.setActiveTab(tab);
            }
        });
    }
}

function showToast(s) {
    if (!consoleShowFlag) {
        document.getElementById('console-btn').click();
    }
    Ext.getCmp('console').setValue(s);
}

function showError(s) {
    if (!consoleShowFlag) {
        document.getElementById('console-btn').click();
    }
    Ext.getCmp('console').setValue(s);
}

function showErrorFlag() {
    Ext.toast({
        html: `<span style="color: red">出现错误, 请查看日志!</span>`,
        closable: false,
        align: 't',
        slideInDuration: 400
    });
}

function toast(msg) {
    Ext.toast({
        html: msg,
        closable: false,
        align: 't',
        slideInDuration: 400
    });
}

function showPrompt(title, msg, fn, dom, value) {
    let options = {
        title: title,
        width: 300,
        msg: msg,
        prompt: true,
        buttons: Ext.MessageBox.OKCANCEL,
        scope: this
    };
    if (title !== undefined) options.title = title;
    if (msg !== undefined) options.msg = msg;
    if (value !== undefined) options.value = value;
    if (fn !== undefined) options.fn = function (btn, text) {
        if (btn == 'ok')
            fn(text);
    };
    if (dom !== undefined) options.animateTarget = dom;
    Ext.MessageBox.show(options).focus();
}

function showConfirm(msg, fn, dom, icon) {
    let options = {
        title: '提示',
        width: 300,
        msg: msg,
        icon: icon ? icon : Ext.MessageBox.QUESTION,
        buttons: Ext.MessageBox.YESNO,
        scope: this
    };
    if (msg !== undefined) options.msg = msg;
    if (fn !== undefined) options.fn = function (btn) {
        if (btn == 'yes')
            fn();
    };
    if (dom !== undefined) options.animateTarget = dom;
    Ext.MessageBox.show(options).focus();
}

function doSomeThing(text) {
    switch (text) {
        case '[选择模板]': {
            Ext.create('Ext.window.Window', {
                title: '选择模板',
                width: 300,
                layout: 'fit',
                fixed: true,
                animateTarget: this,
                resizable: false,
                constrain: true,
                modal: true,
                items: {
                    xtype: 'combobox',
                    margin: '10',
                    store: {
                        fields: ['id', 'text'],
                        data: execute('parentData', 'getAll')
                    },
                    queryMode: 'local',
                    displayField: 'text',
                    valueField: 'id',
                    listeners: {
                        afterrender: function (field) {
                            Ext.defer(function () {
                                field.focus(true, 100);
                            }, 1);
                        }
                    }
                },
                buttonAlign: 'center',
                buttons: [{
                    text: '确定',
                    handler: function () {
                        const combo = this.up('window').down('combobox');
                        const row = combo.getSelectedRecord();
                        if (row == null) {
                            Ext.toast({
                                html: `<span style="color: red;">请选择至少一条数据!</span>`,
                                autoClose: true,
                                align: 't',
                                slideDUration: 400,
                                maxWidth: 400
                            });
                            return;
                        }
                        this.up('window').close();
                        changeTemplate(row.id);
                    }
                }, {
                    text: '取消',
                    handler: function () {
                        this.up('window').close();
                    }
                }
                ]
            }).show().focus();
            break;
        }
        case '[创建模板]': {
            createTemplate();
            break;
        }
        case '[查看详情]': {
            openSome({id: 'logger', title: '系统日志', type: 'logger'});
            break;
        }
    }
}

function checkNew(id, flag) {
    if (utils.isEmpty(id)) {
        return;
    }
    const d = execute('parentData', 'getById', [id]);
    if (utils.isEmpty(d.detailId)) {
        return;
    }
    Ext.Ajax.request({
        url: execute('userConfig', 'getUrl') + '/checkNew',
        method: 'POST',
        jsonData: {id: d.detailId, pid: d.serveId},
        success: function (response) {
            const res = Ext.util.JSON.decode(response.responseText);
            if (res) {
                Ext.Ajax.request({
                    url: execute('userConfig', 'getUrl') + '/getNewest/' + d.serveId,
                    method: 'POST',
                    jsonData: {},
                    success: function (response) {
                        const jsonResp = Ext.util.JSON.decode(response.responseText);
                        showConfirm(`检查到新的模板,是否立即更新?`, function (text) {
                            Ext.getCmp('main-content').mask('下载中, 请稍等...');
                            const local = execute('parentData', 'getByServeId', [jsonResp.Pid]);
                            utils.downloadFile(jsonResp.User + '/' + jsonResp.Id + '.zip', jsonResp.Id + '.zip').then(d => {
                                jsCode.updateTemplate(d, local, jsonResp).then(msg => {
                                    Ext.getCmp('main-content').unmask();
                                    showToast('[success] 更新成功!');
                                    jsCode.deleteFile(d);
                                    if (pId == local.id) {
                                        changeTemplate(local.id);

                                    }
                                }).catch(e => {
                                    console.error(e);
                                    Ext.getCmp('main-content').unmask();
                                    showError(e);
                                    jsCode.deleteFile(d);
                                });
                            }).catch(err => {
                                console.error(err);
                                Ext.getCmp('main-content').unmask();
                                showError('[error] ' + err);
                            });
                        }, null, Ext.MessageBox.QUESTION);
                    }
                });
            } else {
                if (flag) {
                    Ext.MessageBox.show({
                        title: '检查更新',
                        msg: '当前模板已经是最新模板!',
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.INFO
                    });
                }
            }
        },
        failure: function (response) {
            console.log(response);
        }
    });
}

function updateNowTemplate() {
    if (utils.isEmpty(pId)) {
        showToast('[info] 当前未选择模板无需更新...');
        return;
    }
    const d = execute('parentData', 'getById', [pId]);
    if (utils.isEmpty(d.detailId)) {
        showToast('[info] 当前模板为本地模板无需更新...');
        return;
    }
    showToast('[info] 检查当前模板是否有新版本中...');
    checkNew(pId, true);
}

function createTemplate(t) {
    Ext.create('Ext.window.Window', {
        title: '模板名称',
        fixed: true,
        width: 300,
        layout: 'fit',
        resizable: false,
        animateTarget: t,
        constrain: true,
        modal: true,
        items: {
            xtype: 'textfield',
            margin: '10',
            listeners: {
                afterrender: function (field) {
                    Ext.defer(function () {
                        field.focus(true, 100);
                    }, 1);
                }
            }
        },
        buttonAlign: 'center',
        buttons: [{
            text: '确定',
            handler: function () {
                const field = this.up('window').down('textfield');
                const text = field.getRawValue();
                if (utils.isEmpty(text)) {
                    Ext.toast({
                        html: `<span style="color: red;">请输入名称!</span>`,
                        autoClose: true,
                        align: 't',
                        slideDUration: 400,
                        maxWidth: 400
                    });
                    return;
                }
                require('electron').remote.getCurrentWindow().setTitle(`代码构建工具[${text}]`);
                pId = execute('parentData', 'setData', [text]);
                this.up('window').close();
                global.data['historyId'] = pId;
                executeCache('setCache', ['historyId', pId]);
                moduleId = pId;
                execute('history', 'setMode', [pId]);
                const root = Ext.getCmp('panel-model').getRootNode();
                root.removeAll();
                root.appendChild(execute('data', 'getData', [pId]));
                execute('history', 'removeAll');
                Ext.getCmp('panel-model').setTitle(text);
                Ext.getCmp('mainmenutab').removeAll();
                try {
                    eval(execute('geFileData', 'getSwig', [pId]));
                } catch (e) {
                    console.error(e);
                    showError(e);
                }
                getFilesData();
                jsCode.createFolder(pId);
                jsCode.initFile(pId);
                setJsData();
                ipcRenderer.send('runCode', {type: 'refreshFile'});
                command.cdTargetFolder(jsCode.getFolder(pId));
            }
        }, {
            text: '取消',
            handler: function () {
                this.up('window').close();
            }
        }]
    }).show().focus();
}

function changeTemplate(newPId) {
    closeNodeWin();
    pId = newPId;
    moduleId = pId;
    global.data['historyId'] = pId;
    executeCache('setCache', ['historyId', pId]);
    execute('history', 'setMode', [pId]);
    Ext.getCmp('main-content').mask('切换中...');
    const root = Ext.getCmp('panel-model').getRootNode();
    root.removeAll();
    const list = execute('data', 'getData', [pId]);
    list.forEach(d => d.icon = './images/database_save.svg');
    root.appendChild(list);
    execute('history', 'removeAll');
    const mode = execute('parentData', 'getById', [pId]);
    Ext.getCmp('panel-model').setTitle(mode.text);
    Ext.getCmp('mainmenutab').removeAll();
    try {
        eval(execute('geFileData', 'getSwig', [pId]));
    } catch (e) {
        console.error(e);
        showError(e);
    }
    jsCode.createFolder(pId);
    jsCode.initFile(pId);
    setJsData();
    command.cdTargetFolder(jsCode.getFolder(pId));
    getFilesData();
    registerAllSuggestion();
    checkNew(pId);
    Ext.getCmp('main-content').unmask();
    require('electron').remote.getCurrentWindow().setTitle(`代码构建工具[${mode.text}]`);
    ipcRenderer.send('runCode', {type: 'refreshFile'});
    title = mode.text;
    showToast('[info] 切换模板为:' + mode.text);
}

function installTemplateAllPkg() {
    const packages = execute('packageConfig', 'getAll', [pId]);
    if (Ext.getCmp('terminal').hidden) {
        document.getElementById('terminal-btn').click();
        const folder = jsCode.getFolder(pId);
        command.cdTargetFolder(folder);
    }
    packages.forEach(p => {
        command.write('npm install ' + p.name + '@' + p.version);
    });
}

function showHelpFile(id, t, d) {
    Ext.getBody().mask('加载中...');
    Ext.require(controllers['help'], function () {
        Ext.getBody().unmask();
        Ext.create('Ext.window.Window', {
            title: t,
            fixed: true,
            resizable: true,
            maximizable: true,
            modal: true,
            constrain: true,
            icon: './images/help.svg',
            width: '80%',
            height: '80%',
            layout: 'fit',
            minWidth: 300,
            minHeight: 250,
            animateTarget: d,
            items: {
                xtype: 'help',
                id: id
            },
            buttons: [{
                text: '关闭',
                handler: function () {
                    this.up('window').close();
                }
            }]
        }).show().focus();
    });
}

function createFile(dom) {
    if (pId == undefined || pId == null || pId.trim().length == 0) {
        showToast('请先[选择模板]或[创建模板]!');
        return;
    }
    Ext.getCmp('main-content').mask('执行中...');
    const files = [],
        generatorData = execute('geFileData', 'getFileData', [pId]);
    const allModuleData = execute('controlData', 'getModuleData', [pId]);
    generatorData.forEach(f => {
        if (!utils.isEmpty(f.file) && !utils.isEmpty(f.content)) {
            const {updateType} = execute('fileData', 'getFile', [f.id]);
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
            files.push(f);
        }
    });
    Ext.create('Ext.window.Window', {
        id: 'generate-win',
        title: '生成文件',
        width: '85%',
        height: '85%',
        layout: 'fit',
        resizable: true,
        maximizable: true,
        constrain: true,
        animateTarget: dom,
        modal: true,
        viewModel: {
            data: {
                after: execute('userConfig', 'getConfig', ['afterShell']),
                before: execute('userConfig', 'getConfig', ['beforeShell']),
            }
        },
        tbar: [
            {
                xtype: 'checkbox',
                bind: '{before}',
                fieldLabel: '执行创建前脚本',
                inputValue: 'before',
                boxLabel: `<img src="images/before.svg" style="width: 16px;"/>`,
                onChange: function (v, o) {
                    if (v != o) {
                        execute('userConfig', 'setConfig', ['beforeShell', v]);
                    }
                }
            }, '-',
            {
                xtype: 'checkbox',
                bind: '{after}',
                fieldLabel: '执行创建后脚本',
                name: 'after',
                boxLabel: `<img src="images/after.svg" style="width: 16px;"/>`,
                onChange: function (v, o) {
                    if (v != o) {
                        execute('userConfig', 'setConfig', ['afterShell', v]);
                    }
                }
            }
        ],
        items: {
            xtype: 'grid',
            layout: 'fit',
            selType: 'checkboxmodel',
            columnLines: true,
            enableLocking: true,
            maxHeight: 600,
            store: Ext.create('Ext.data.Store', {
                data: files
            }),
            plugins: [{
                ptype: 'rowexpander',
                rowBodyTpl: ['<p><b>名称:</b> {file}</p>', '<p><b>文件:</b> {name}</p>']
            }],
            columns: [
                new Ext.grid.RowNumberer(),
                {
                    text: '名称',
                    align: 'center',
                    dataIndex: 'name',
                    flex: 1,
                    tdCls: 'direction-rtl'
                },
                {
                    text: '是否存在',
                    align: 'center',
                    dataIndex: 'flag',
                    width: 100,
                    locked: true,
                    renderer: function (value, metaData) {
                        if (value == '是')
                            metaData.style = "color:red";
                        return value;
                    }
                },
                {
                    text: '类型',
                    align: 'center',
                    dataIndex: 'type',
                    width: 70,
                    locked: true,
                    renderer: function (value, metaData) {
                        if (value == 'update')
                            metaData.style = "color:blue";
                        return value;
                    }
                }
            ],
            listeners: {
                render: function (dom) {
                    dom.getSelectionModel().selectAll();
                    Ext.getCmp('main-content').unmask();
                }
            }
        },
        buttonAlign: 'center',
        buttons: [
            {
                text: '生成', handler: function () {
                    const win = require('electron').remote.getCurrentWindow();
                    const {before, after} = this.up('window').getViewModel().getData();
                    Ext.getCmp('main-content').mask('执行中...');
                    closeNodeWin();
                    const grid = this.up('window').down('grid');
                    const selected = grid.getSelectionModel().getSelection();
                    this.up('window').close();
                    runMethod('operation', 'create', [{
                        pId: pId,
                        name: `[${execute('parentData', 'getById', [pId]).text}]`,
                        success: true,
                        date: utils.getNowTime()
                    }]).then(({dataValues}) => {
                        const operationId = dataValues.id;
                        if (before) {
                            nodeRun('(function(){' + execute('geFileData', 'getBeforeShell', [pId]) + '})();').then(d => {
                                showToast('[success] 创建前JS脚本执行成功');
                                win.setProgressBar(0.2);
                                selected.map((row, i) => {
                                    const f = row.data;
                                    if (f.type == 'add') {
                                        try {
                                            const tplPre = swig.compile(f.content);
                                            f.preview = tplPre(allModuleData);
                                        } catch (e) {
                                            console.error(e);
                                            showError(f.file + ':模板错误');
                                            Ext.getCmp('main-content').unmask();
                                            runMethod('operation', 'update', [{
                                                id: operationId,
                                                success: false,
                                                errMsg: e.toString()
                                            }]);
                                            throw e;
                                        }
                                    } else {
                                        const filePath = f.name.replace(/\\/g, '\/');
                                        try {
                                            f.preview = jsCode.runNodeJs(`const content = \`${require('fs').readFileSync(filePath, 'utf8').toString().replace(/\\/g, '\\\\').replace(/\$/g, '\\$').replace(/\`/g, '\\`')}\`;\n` + f.content);
                                        } catch (e) {
                                            console.error(e);
                                            showError(e);
                                            runMethod('operation', 'update', [{
                                                id: operationId,
                                                success: false,
                                                errMsg: e.toString()
                                            }]);
                                            Ext.getCmp('main-content').unmask();
                                            throw e;
                                        }
                                    }
                                    const oldContent = f.flag == '是' ? utils.readFile(f.name) : null;
                                    utils.createFile(f.name, f.preview);
                                    runMethod('operationDetail', 'create', [{
                                        pId: operationId,
                                        date: utils.getNowTime(),
                                        type: f.type,
                                        file: f.name,
                                        tempId: f.id,
                                        content: f.preview,
                                        oldContent: oldContent,
                                        flag: f.flag == '是'
                                    }]);
                                    showToast('[success] ' + f.name + ' 生成成功!');
                                    if (after) {
                                        const progressVal = (0.6 / selected.length) * (i + 1) + 0.2;
                                        win.setProgressBar(progressVal);
                                        Ext.getCmp('msg-bar').setProgress(`生成中${progressVal}...`, progressVal);
                                    } else {
                                        const progressVal = (0.8 / selected.length) * (i + 1) + 0.2;
                                        win.setProgressBar(progressVal);
                                        Ext.getCmp('msg-bar').setProgress(`生成中${progressVal}...`, progressVal);
                                    }
                                });
                                showToast('[success] 文件创建完成');
                                if (after) {
                                    nodeRun('(function(){' + execute('geFileData', 'getShell', [pId]) + '})();').then(d => {
                                        showToast('[success] 创建后JS脚本执行成功');
                                        Ext.getCmp('main-content').unmask();
                                        win.setProgressBar(1);
                                        setTimeout(() => {
                                            win.setProgressBar(-1);
                                            Ext.getCmp('msg-bar').closeProgress();
                                            new Notification('代码创建成功', {
                                                body: `[${title}]代码创建成功`,
                                                icon: 'images/success.png'
                                            });
                                        }, 200);
                                    }).catch(e => {
                                        console.error(e);
                                        showError(e);
                                        showErrorFlag();
                                        Ext.getCmp('main-content').unmask();
                                        win.setProgressBar(-1);
                                        Ext.getCmp('msg-bar').closeProgress();
                                        runMethod('operation', 'update', [{
                                            id: operationId,
                                            success: false,
                                            errMsg: e.toString()
                                        }]);
                                        new Notification('代码创建失败', {
                                            body: `[${title}]代码创建失败, 错误信息:${e}`,
                                            icon: 'images/error.png'
                                        });
                                    });
                                } else {
                                    Ext.getCmp('main-content').unmask();
                                    win.setProgressBar(-1);
                                    Ext.getCmp('msg-bar').closeProgress();
                                    new Notification('代码创建成功', {
                                        body: `[${title}]代码创建成功`,
                                        icon: 'images/success.png'
                                    });
                                }
                            }).catch(e => {
                                console.error(e);
                                showError(e);
                                showErrorFlag();
                                Ext.getCmp('main-content').unmask();
                                win.setProgressBar(-1);
                                Ext.getCmp('msg-bar').closeProgress();
                                runMethod('operation', 'update', [{
                                    id: operationId,
                                    success: false,
                                    errMsg: e.toString()
                                }]);
                                new Notification('代码创建失败', {
                                    body: `[${title}]代码创建失败, 错误信息:${e}`,
                                    icon: 'images/error.png'
                                });
                            });
                        } else {
                            selected.map((row, i) => {
                                const f = row.data;
                                if (f.type == 'add') {
                                    try {
                                        const tplPre = swig.compile(f.content);
                                        f.preview = tplPre(allModuleData);
                                    } catch (e) {
                                        console.error(e);
                                        showError(f.file + ':模板错误');
                                        Ext.getCmp('main-content').unmask();
                                        win.setProgressBar(-1);
                                        Ext.getCmp('msg-bar').closeProgress();
                                        runMethod('operation', 'update', [{
                                            id: operationId,
                                            success: false,
                                            errMsg: e.toString()
                                        }]);
                                        new Notification('代码创建失败', {
                                            body: `[${title}]代码创建失败, 错误信息:${e}`,
                                            icon: 'images/error.png'
                                        });
                                        throw e;
                                    }
                                } else {
                                    const filePath = f.name.replace(/\\/g, '\/');
                                    try {
                                        f.preview = jsCode.runNodeJs(`const content = \`${require('fs').readFileSync(filePath, 'utf8').toString().replace(/\\/g, '\\\\').replace(/\$/g, '\\$').replace(/\`/g, '\\`')}\`;\n` + f.content);
                                    } catch (e) {
                                        console.error(e);
                                        showError(e);
                                        Ext.getCmp('main-content').unmask();
                                        win.setProgressBar(-1);
                                        Ext.getCmp('msg-bar').closeProgress();
                                        runMethod('operation', 'update', [{
                                            id: operationId,
                                            success: false,
                                            errMsg: e.toString()
                                        }]);
                                        new Notification('代码创建失败', {
                                            body: `[${title}]代码创建失败, 错误信息:${e}`,
                                            icon: 'images/error.png'
                                        });
                                        throw e;
                                    }
                                }
                                const oldContent = f.flag == '是' ? utils.readFile(f.name) : null;
                                utils.createFile(f.name, f.preview);
                                runMethod('operationDetail', 'create', [{
                                    pId: operationId,
                                    date: utils.getNowTime(),
                                    type: f.type,
                                    file: f.name,
                                    tempId: f.id,
                                    content: f.preview,
                                    oldContent: oldContent,
                                    flag: f.flag == '是'
                                }]);
                                showToast('[success] ' + f.name + ' 生成成功!');
                                if (after) {
                                    const progressVal = (0.8 / selected.length) * (i + 1);
                                    win.setProgressBar(progressVal);
                                    Ext.getCmp('msg-bar').setProgress(`生成中${progressVal}...`, progressVal);
                                } else {
                                    const progressVal = (1 / selected.length) * (i + 1);
                                    win.setProgressBar(progressVal);
                                    Ext.getCmp('msg-bar').setProgress(`生成中${progressVal}...`, progressVal);
                                }
                            });
                            showToast('[info] 文件创建完成');
                            if (after) {
                                nodeRun('(function(){' + execute('geFileData', 'getShell', [pId]) + '})();').then(d => {
                                    showToast('[success] 创建后JS脚本执行成功');
                                    Ext.getCmp('main-content').unmask();
                                    win.setProgressBar(1);
                                    Ext.getCmp('msg-bar').setProgress(`生成完成`, 1);
                                    setTimeout(() => {
                                        win.setProgressBar(-1);
                                        Ext.getCmp('msg-bar').closeProgress();
                                        new Notification('代码创建成功', {
                                            body: `[${title}]代码创建成功`,
                                            icon: 'images/success.png'
                                        });
                                    }, 200);
                                }).catch(e => {
                                    console.error(e);
                                    showError(e);
                                    showErrorFlag();
                                    Ext.getCmp('main-content').unmask();
                                    win.setProgressBar(-1);
                                    Ext.getCmp('msg-bar').closeProgress();
                                    runMethod('operation', 'update', [{
                                        id: operationId,
                                        success: false,
                                        errMsg: e.toString()
                                    }]);
                                    new Notification('代码创建失败', {
                                        body: `[${title}]代码创建失败, 错误信息:${e}`,
                                        icon: 'images/error.png'
                                    });
                                });
                            } else {
                                Ext.getCmp('main-content').unmask();
                                win.setProgressBar(-1);
                                Ext.getCmp('msg-bar').closeProgress();
                                new Notification('代码创建成功', {
                                    body: `[${title}]代码创建成功`,
                                    icon: 'images/success.png'
                                });
                            }
                        }
                    });
                }
            },
            {
                text: '取消', handler: function () {
                    this.up('window').close();
                }
            }
        ]
    }).show().focus();
}

document.onkeydown = function () {
    const oEvent = window.event;
    if (oEvent.keyCode == 116 && Ext.getCmp('generate-win') === undefined) {
        createFile();
    }
};

function setDefaultUrl() {
    const request = require('request');
    request('https://gitee.com/onioncssjs/GenerateTool/raw/master/package.json', function (error, response, body) {
        try {
            const d = JSON.parse(body);
            execute('userConfig', 'setDefaultUrl', [d.url]);
            const oldVersion = utils.getVersion();
            if (parseInt(d.version.replace(/[^0-9]/ig, "")) > parseInt(oldVersion.replace(/[^0-9]/ig, ""))) {
                const platform = process.platform;
                if (platform != 'win32') return;
                showToast(`[info] 检测到新版本(${d.version}),开始下载安装包...`);
                showToast(`[info] 新版本下载路径为:${d.url}/download/GenerateTool-Setup-v${d.version}.exe`);
                utils.downloadFile(`GenerateTool-Setup-v${d.version}.exe`, `GenerateTool-Setup-v${d.version}.exe`, `${d.url}/download/GenerateTool-Setup-v${d.version}.exe`).then(d => {
                    showToast(`[success] 下载成功(路径为:${d})!`);
                    showConfirm(`安装包下载成功是否退出并安装更新?`, function () {
                        try {
                            const {app} = require('electron').remote;
                            app.showExitPrompt = false;
                            app.quit();
                            utils.runFile(d);
                        } catch (e) {
                            showErrorFlag();
                            showError('[error] 安装失败,请使用管理员打开或直接在文件夹安装,更新包路径为:' + d);
                        }
                    }, undefined, Ext.MessageBox.ERROR);
                });
            } else {
                const p = execute('help', 'getDataPath');
                jsCode.deleteFile(p + `/GenerateTool-Setup-v${oldVersion}.exe`);
            }
        } catch (e) {
            console.log(e);
        }
    });
}

// 获取后台脚本进程是否存在
setInterval(() => {
    if (runWin) {
        document.getElementById("run-code").style.display = "block";
    } else {
        document.getElementById("run-code").style.display = "none";
    }
}, 1000);
