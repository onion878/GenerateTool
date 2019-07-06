const ipcRenderer = require('electron').ipcRenderer;
const data = require('../service/dao/modeData');
const parentData = require('../service/dao/mode');
const history = require('../service/dao/history');
const jsCode = require('../service/utils/JscodeUtil');
const systemConfig = require('../service/dao/system');
const userConfig = require('../service/dao/user');
const packageConfig = require('../service/dao/package');
const controlData = require('../service/dao/controls');
const fileData = require('../service/dao/file');
const geFileData = require('../service/dao/gefile');
const operation = require('../service/dao/operation');
const swig = require('swig');
const utils = require('../service/utils/utils');
const command = require('../service/utils/commands');

let consoleShowFlag = false;
let pId = history.getMode();

ipcRenderer.send('loading-msg', '服务加载中...');
Ext.application({
    requires: ['Ext.container.Viewport'],
    name: 'OnionSpace',
    appFolder: 'app',
    controllers: [
        'Mode',
        'Editor',
        'Code',
        'Pkg',
        'Unpkg',
        'Minicode',
        'Welcome',
        'Generate',
        'Templet',
        'OnlineTemp',
        'DetailTemp',
        'SwigTemplate',
        'Statusbar',
        'Setting',
        'Message',
        'AfterShell',
        'BeforeShell',
        'Logger',
        'Operation'
    ],
    launch: function () {
        ipcRenderer.send('loading-msg', '模块加载中...');
        moduleId = pId;
        const datas = data.getData(pId);
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
        let title = '数据模板';
        if (pId !== '') {
            title = parentData.getById(pId).text;
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
            items: [{
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
                    , {
                        region: 'west',
                        title: '系统菜单',
                        split: true,
                        width: 240,
                        minWidth: 160,
                        maxWidth: 400,
                        collapsible: true,
                        xtype: 'tabpanel',
                        tabPosition: 'left',
                        items: [{
                            title: '模板',
                            margins: '0 0 0 0',
                            layout: 'accordion',
                            items: [{
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
                                                        data.removeById(record.data.id);
                                                        store.setRoot({
                                                            expanded: true,
                                                            text: '',
                                                            children: data.getData(pId)
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
                                                            data: parentData.getAll()
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
                                                            const row = combo.getSelectedRecord();
                                                            if (row === null) {
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
                                                Ext.create('Ext.window.Window', {
                                                    title: '模板名称',
                                                    fixed: true,
                                                    width: 300,
                                                    layout: 'fit',
                                                    animateTarget: this,
                                                    resizable: false,
                                                    constrain: true,
                                                    modal: true,
                                                    items: {
                                                        xtype: 'textfield',
                                                        margin: '10'
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
                                                            pId = parentData.setData(text);
                                                            this.up('window').close();
                                                            moduleId = pId;
                                                            history.setMode(pId);
                                                            const root = Ext.getCmp('panel-model').getRootNode();
                                                            root.removeAll();
                                                            root.appendChild(data.getData(pId));
                                                            history.removeAll();
                                                            Ext.getCmp('panel-model').setTitle(text);
                                                            Ext.getCmp('mainmenutab').removeAll();
                                                            try {
                                                                eval(geFileData.getSwig(pId));
                                                            } catch (e) {
                                                                console.error(e);
                                                                showError(e);
                                                            }
                                                            getFilesData();
                                                            jsCode.createFolder(pId);
                                                            jsCode.initFile(pId);
                                                            setJsData();
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
                                                const modes = data.getData(pId);
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
                                                                if (m.text === t) {
                                                                    ifAdd = false;
                                                                }
                                                            });
                                                            if (ifAdd) {
                                                                data.setData(t, pId);
                                                            }
                                                            this.up('window').close();
                                                            const root = Ext.getCmp('panel-model').getRootNode();
                                                            root.removeAll();
                                                            const list = data.getData(pId);
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
                            }, {
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
                                            fileData.updateRootId(id, paId);
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
                                        const child = fileData.getFiles(pId, node.data.id);
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
                                            items: [{
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
                                                                name: 'name'
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
                                                                    const child = fileData.saveOrUpdate(data);
                                                                    geFileData.save(child.id, pId);
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
                                                            const child = fileData.saveOrUpdate(data);
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
                                                        } = geFileData.getOneData(record.get('id'));
                                                        const fileTpl = swig.compile(file);
                                                        const fileOutput = fileTpl(controlData.getModuleData(pId));
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
                                                                        xtype: 'textfield',
                                                                        fieldLabel: '文件',
                                                                        margin: '10',
                                                                        emptyText: '如:{{folder}}/{{file.mapper}}',
                                                                        labelWidth: 45,
                                                                        name: 'file',
                                                                        value: file,
                                                                        listeners: {
                                                                            change: function (dom, val) {
                                                                                let output = val;
                                                                                try {
                                                                                    const tpl = swig.compile(val);
                                                                                    output = tpl(controlData.getModuleData(pId));
                                                                                } catch (e) {
                                                                                    console.error(e);
                                                                                }
                                                                                this.up('form').down('textareafield').setValue(output);
                                                                            }
                                                                        }
                                                                    },
                                                                    {
                                                                        xtype: 'textareafield',
                                                                        fieldLabel: '预览',
                                                                        margin: '10',
                                                                        readOnly: true,
                                                                        labelWidth: 45,
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
                                                                        geFileData.updateDataFile(record.get('id'), d.file);
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
                                                        showPrompt('名称', '', function (val) {
                                                            if (val.trim().length > 0) {
                                                                fileData.updateName(record.get('id'), val);
                                                                record.set('text', val);
                                                                node.refresh();
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
                                                            fileData.removeFile(rId);
                                                            geFileData.removeData(rId);
                                                            Ext.getCmp('mainmenutab').remove(rId);
                                                            const removeList = fileData.getTreeData(record.get('id'), pId);
                                                            removeList.forEach(r => {
                                                                fileData.removeFile(r.id);
                                                                geFileData.removeData(r.id);
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
                                        qtip: '开始创建',
                                        listeners: {
                                            click: function () {
                                                if (pId == undefined || pId == null || pId.trim().length == 0) {
                                                    showToast('请先[选择模板]或[创建模板]!');
                                                    return;
                                                }
                                                Ext.getCmp('main-content').mask('执行中...');
                                                const files = [],
                                                    generatorData = geFileData.getFileData(pId);
                                                const allModuleData = controlData.getModuleData(pId);
                                                generatorData.forEach(f => {
                                                    if (!utils.isEmpty(f.file) && !utils.isEmpty(f.content)) {
                                                        const type = fileData.getFile(f.id).updateType;
                                                        const tpl = swig.compile(f.file);
                                                        f.name = tpl(allModuleData);
                                                        const flag = utils.fileExists(f.name);
                                                        if (flag) {
                                                            f.flag = '是';
                                                        } else {
                                                            f.flag = '否';
                                                        }
                                                        f.type = type;
                                                        files.push(f);
                                                    }
                                                });
                                                Ext.getCmp('main-content').unmask();
                                                Ext.create('Ext.window.Window', {
                                                    title: '生成文件',
                                                    fixed: true,
                                                    width: '85%',
                                                    layout: 'fit',
                                                    resizable: true,
                                                    constrain: true,
                                                    animateTarget: this,
                                                    maxHeight: 600,
                                                    modal: true,
                                                    viewModel: {
                                                        data: {
                                                            after: true,
                                                            before: true,
                                                        }
                                                    },
                                                    tbar: [
                                                        {
                                                            xtype: 'checkbox',
                                                            bind: '{before}',
                                                            fieldLabel: '执行创建前脚本',
                                                            inputValue: 'before',
                                                            labelWidth: 110,
                                                            boxLabel: `<img src="images/before.svg" style="width: 16px;"/>`
                                                        }, '-',
                                                        {
                                                            xtype: 'checkbox',
                                                            bind: '{after}',
                                                            fieldLabel: '执行创建后脚本',
                                                            name: 'after',
                                                            labelWidth: 110,
                                                            boxLabel: `<img src="images/after.svg" style="width: 16px;"/>`
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
                                                                let operationId = null;
                                                                if (before) {
                                                                    nodeRun('(function(){' + geFileData.getBeforeShell(pId) + '})();').then(d => {
                                                                        showToast('[info] 创建前JS脚本执行成功');
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
                                                                                    throw e;
                                                                                }
                                                                            } else {
                                                                                const filePath = f.name.replace(/\\/g, '\/');
                                                                                try {
                                                                                    f.preview = jsCode.runNodeJs(`const content = \`${require('fs').readFileSync(filePath, 'utf8').toString().replace(/\\/g, '\\\\').replace(/\$/g, '\\$').replace(/\`/g, '\\`')}\`;` + f.content);
                                                                                } catch (e) {
                                                                                    console.error(e);
                                                                                    showError(e);
                                                                                    Ext.getCmp('main-content').unmask();
                                                                                    throw e;
                                                                                }
                                                                            }
                                                                            const oldContent = utils.readFile(f.name);
                                                                            utils.createFile(f.name, f.preview);
                                                                            operationId = operation.setOperation({
                                                                                id: operationId,
                                                                                date: utils.getNowTime(),
                                                                                pId: pId,
                                                                                name: `[${parentData.getById(pId).text}]`
                                                                            }, {
                                                                                pId: operationId,
                                                                                date: utils.getNowTime(),
                                                                                type: f.type,
                                                                                file: f.name,
                                                                                tempId: f.id,
                                                                                content: f.preview,
                                                                                oldContent: oldContent
                                                                            });
                                                                            showToast('[info] ' + f.name + ' 生成成功!');
                                                                            if (after) {
                                                                                win.setProgressBar((0.6 / selected.length) * (i + 1) + 0.2);
                                                                            } else {
                                                                                win.setProgressBar((0.8 / selected.length) * (i + 1) + 0.2);
                                                                            }
                                                                        });
                                                                        showToast('[info] 文件创建完成');
                                                                        if (after) {
                                                                            nodeRun('(function(){' + geFileData.getShell(pId) + '})();').then(d => {
                                                                                showToast('[info] 创建后JS脚本执行成功');
                                                                                Ext.getCmp('main-content').unmask();
                                                                                win.setProgressBar(1);
                                                                                setTimeout(() => {
                                                                                    win.setProgressBar(-1);
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
                                                                                new Notification('代码创建失败', {
                                                                                    body: `[${title}]代码创建失败, 错误信息:${e}`,
                                                                                    icon: 'images/error.png'
                                                                                });
                                                                            });
                                                                        } else {
                                                                            Ext.getCmp('main-content').unmask();
                                                                            win.setProgressBar(-1);
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
                                                                                throw e;
                                                                            }
                                                                        } else {
                                                                            const filePath = f.name.replace(/\\/g, '\/');
                                                                            try {
                                                                                f.preview = jsCode.runNodeJs(`const content = \`${require('fs').readFileSync(filePath, 'utf8').toString().replace(/\\/g, '\\\\').replace(/\$/g, '\\$').replace(/\`/g, '\\`')}\`;` + f.content);
                                                                            } catch (e) {
                                                                                console.error(e);
                                                                                showError(e);
                                                                                Ext.getCmp('main-content').unmask();
                                                                                throw e;
                                                                            }
                                                                        }
                                                                        const oldContent = utils.readFile(f.name);
                                                                        utils.createFile(f.name, f.preview);
                                                                        operationId = operation.setOperation({
                                                                            id: operationId,
                                                                            date: utils.getNowTime(),
                                                                            pId: pId,
                                                                            name: `[${parentData.getById(pId).text}]`
                                                                        }, {
                                                                            pId: operationId,
                                                                            date: utils.getNowTime(),
                                                                            type: f.type,
                                                                            file: f.name,
                                                                            tempId: f.id,
                                                                            content: f.preview,
                                                                            oldContent: oldContent
                                                                        });
                                                                        showToast('[info] ' + f.name + ' 生成成功!');
                                                                        if (after) {
                                                                            win.setProgressBar((0.8 / selected.length) * (i + 1) + 0.2);
                                                                        } else {
                                                                            win.setProgressBar((1 / selected.length) * (i + 1) + 0.2);
                                                                        }
                                                                    });
                                                                    showToast('[info] 文件创建完成');
                                                                    if (after) {
                                                                        nodeRun('(function(){' + geFileData.getShell(pId) + '})();').then(d => {
                                                                            showToast('[info] 创建后JS脚本执行成功');
                                                                            Ext.getCmp('main-content').unmask();
                                                                            win.setProgressBar(1);
                                                                            setTimeout(() => {
                                                                                win.setProgressBar(-1);
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
                                                                            new Notification('代码创建失败', {
                                                                                body: `[${title}]代码创建失败, 错误信息:${e}`,
                                                                                icon: 'images/error.png'
                                                                            });
                                                                        });
                                                                    } else {
                                                                        Ext.getCmp('main-content').unmask();
                                                                        win.setProgressBar(-1);
                                                                        new Notification('代码创建成功', {
                                                                            body: `[${title}]代码创建成功`,
                                                                            icon: 'images/success.png'
                                                                        });
                                                                    }
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
                            }]
                        }, {
                            title: 'js脚本',
                            id: 'js-data',
                            scrollable: true
                        }]
                    }, {
                        region: 'center',
                        xtype: 'tabpanel',
                        fullscreen: true,
                        id: 'mainmenutab',
                        plugins: new Ext.ux.TabCloseMenu(),
                        items: [],
                        listeners: {
                            tabchange: function (tabPanel, tab) {
                                history.setShowTab(tab.id);
                                labelEditor.cancelEdit();
                            },
                            add: function (tabPanel, tab) {
                                if (tab.initialConfig.useType != 'editor') {
                                    history.setTab({
                                        id: tab.config.id,
                                        params: tab.config.params,
                                        title: tab.config.title,
                                        type: tab.config.xtype,
                                        icon: tab.config.icon
                                    });
                                }
                            },
                            remove: function (tabPanel, tab) {
                                if (tab.initialConfig.useType == 'editor') {
                                    history.removeCodeTab(tab.config.id);
                                } else {
                                    history.removeTab(tab.config.id);
                                }
                                labelEditor.cancelEdit();
                            }
                        }
                    }
                ]
            }]
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
                const tab = tabPanel.add({
                    id: item,
                    pId: pId,
                    title: title,
                    icon: icon,
                    closable: true,
                    params: data,
                    xtype: url
                });
                tabPanel.setActiveTab(tab); // 设置当前tab页
            }
        }

        function setGeFile(btn, id) {
            let d = {};
            if (id != undefined) {
                d = fileData.getFile(id);
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
                            name: 'name'
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
                                const child = fileData.saveOrUpdate(data, id);
                                geFileData.save(child.id, pId);
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
                d = fileData.getFile(id);
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
                const child = fileData.saveOrUpdate(data, id);
                child.icon = './icons/folder-core.svg';
                root.appendChild(child);
            }, btn, d.text);
        }

        setJsData();

        try {
            eval(geFileData.getSwig(pId));
        } catch (e) {
            console.error(e);
            showError(e);
        }
        ipcRenderer.send('loading-msg', '历史加载中...');
        const tabData = history.getTab();
        const tabCode = history.getCode();
        const showTab = history.getShowTab();
        for (let i = 0; i < tabData.length; i++) {
            openSome(tabData[i]);
        }
        for (let i = 0; i < tabCode.length; i++) {
            openCode(tabCode[i]);
        }
        registerAllSuggestion();
        checkNew(pId);
        Ext.getCmp('mainmenutab').setActiveTab(Ext.getCmp(showTab));
        document.body.style.backgroundImage = `url('${userConfig.getBg().replace(/\\/g, '/')}')`;
        document.body.style.backgroundPosition = 'center center !important';
        document.body.style.backgroundRepeat = 'no-repeat no-repeat';
        document.body.style.backgroundSize = '100% 100%';
        document.body.style.opacity = userConfig.getOpacity();
        ipcRenderer.send('loading-success', '加载完成!');
        checkVersion();
    }
});

function checkVersion() {
    const v = systemConfig.getConfig('version'), nV = utils.getVersion();
    if (v == nV) {
        return;
    }
    systemConfig.setConfig('version', nV);
    openSome({id: 'welcome', title: '更新日志', type: 'welcome'});
}

function setJsData() {
    if (pId == undefined || pId == null || pId.trim().length == 0) {
        showToast('请先[选择模板]或[创建模板]!');
        return;
    }
    const main = Ext.getCmp('js-data');
    main.removeAll(true);
    main.add({
        xtype: 'editor',
        pId: pId
    });
}

function getFilesData() {
    let GfData = fileData.getFiles(pId, '0');
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

function openSome({id, title, type, params, icon}) {
    const panel = "mainmenutab";
    const tabPanel = Ext.getCmp(panel);
    const taa = Ext.getCmp(id);
    if (taa) {
        tabPanel.setActiveTab(taa);
    } else {
        const tab = tabPanel.add({
            id: id,
            title: title,
            pId: history.getMode(),
            closable: true,
            icon: icon,
            params: params,
            xtype: type
        });
        tabPanel.setActiveTab(tab);
    }
}

function openCode(code) {
    const panel = "mainmenutab";
    const tabPanel = Ext.getCmp(panel);
    const taa = Ext.getCmp(code.id);
    if (taa) {
        tabPanel.setActiveTab(taa);
    } else {
        const tab = tabPanel.add(code);
        tabPanel.setActiveTab(tab);
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
        if (btn === 'ok')
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
        icon: icon,
        buttons: Ext.MessageBox.YESNO,
        scope: this
    };
    if (msg !== undefined) options.msg = msg;
    if (fn !== undefined) options.fn = function (btn) {
        if (btn === 'yes')
            fn();
    };
    if (dom !== undefined) options.animateTarget = dom;
    Ext.MessageBox.show(options).focus();
}

function doSomeThing(text) {
    switch (text) {
        case '[选择模板]': {
            Ext.getCmp('main-change-module').getEl().dom.click();
            break;
        }
        case '[创建模板]': {
            Ext.getCmp('main-create-module').getEl().dom.click();
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
    const d = parentData.getById(id);
    if (utils.isEmpty(d.detailId)) {
        return;
    }
    Ext.Ajax.request({
        url: userConfig.getUrl() + '/checkNew',
        method: 'POST',
        jsonData: {id: d.detailId, pid: d.serveId},
        success: function (response) {
            const res = Ext.util.JSON.decode(response.responseText);
            if (res) {
                Ext.Ajax.request({
                    url: userConfig.getUrl() + '/getNewest/' + d.serveId,
                    method: 'POST',
                    jsonData: {},
                    success: function (response) {
                        const jsonResp = Ext.util.JSON.decode(response.responseText);
                        showConfirm(`检查到新的模板,是否立即更新?`, function (text) {
                            Ext.getCmp('main-content').mask('下载中, 请稍等...');
                            const local = parentData.getByServeId(jsonResp.Pid);
                            utils.downloadFile(jsonResp.User + '/' + jsonResp.Id + '.zip', jsonResp.Id + '.zip').then(d => {
                                jsCode.updateTemplate(d, local, jsonResp).then(msg => {
                                    Ext.getCmp('main-content').unmask();
                                    showToast('[info] [' + data.Name + ']更新成功!');
                                    jsCode.deleteFile(d);
                                    if (history.getMode() == local.id) {
                                        changeTemplate(local.id, true);
                                        return;
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
    showToast('[info] 检查当前模板是否有新版本中...');
    checkNew(pId, true);
}

function changeTemplate(newPId, flag) {
    closeNodeWin();
    pId = newPId;
    moduleId = pId;
    history.setMode(pId);
    Ext.getCmp('main-content').mask('切换中...');
    const root = Ext.getCmp('panel-model').getRootNode();
    root.removeAll();
    const list = data.getData(pId);
    list.forEach(d => d.icon = './images/database_save.svg');
    root.appendChild(list);
    history.removeAll();
    const mode = parentData.getById(pId);
    Ext.getCmp('panel-model').setTitle(mode.text);
    Ext.getCmp('mainmenutab').removeAll();
    try {
        eval(geFileData.getSwig(pId));
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
    showToast('[info] 切换模板为:' + mode.text);
    if (flag) {
        installTemplateAllPkg();
    }
}

function installTemplateAllPkg() {
    const packages = packageConfig.getAll(pId);
    if (Ext.getCmp('terminal').hidden) {
        document.getElementById('terminal-btn').click();
        const folder = jsCode.getFolder(pId);
        command.cdTargetFolder(folder);
    }
    packages.forEach(p => {
        command.write('npm install ' + p.name + '@' + p.version);
    });
}
