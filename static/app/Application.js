const ipcRenderer = require('electron').ipcRenderer;
const data = require('../service/dao/modeData');
const parentData = require('../service/dao/mode');
const history = require('../service/dao/history');
const jsCode = require('../service/utils/JscodeUtil');
const systemConfig = require('../service/dao/system');
const packageConfig = require('../service/dao/package');
const controlData = require('../service/dao/controls');
const fileData = require('../service/dao/file');
const geFileData = require('../service/dao/gefile');
const swig = require('swig');
const utils = require('../service/utils/utils');
const command = require('../service/utils/commands');

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
        'SwigTemplate',
        'Statusbar',
        'Setting',
        'Message',
        'AfterShell',
        'BeforeShell',
        'Logger'
    ],
    launch: function () {
        ipcRenderer.send('loading-msg', '模块加载中...');
        let pId = history.getMode();
        moduleId = pId;
        let store = Ext.create('Ext.data.TreeStore', {
            root: {
                expanded: true,
                children: data.getData(pId)
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
                    {img: './images/log.png', name: 'Console'},
                    {id: 'terminal-btn', img: './images/terminal.png', name: 'Terminal'}
                ],
                click: function (t, dom, name) {
                    if (name == 'Console') {
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
                html: `<div style="background: white;overflow: hidden;" id="term"></div>`,
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
                        {img: './images/stop.png', name: 'Stop'},
                        {img: './images/delete.png', name: 'Clear'}
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
                        {img: './images/delete.png', name: 'Clear'}
                    ],
                    click: function (s, d, n) {
                        Ext.getCmp('console').clear();
                    }
                }
            }, {
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
                                addbutton(item, 'mode', './images/coins_add.png', title, {});
                            },
                            itemcontextmenu: function (node, record, item, index, event, eOpts) {
                                new Ext.menu.Menu({
                                    minWidth: 60,
                                    items: [{
                                        text: '删除',
                                        icon: 'images/cancel.png',
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
                        tools: [{
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
                                                if (row !== null) {
                                                    pId = row.id;
                                                    moduleId = pId;
                                                    history.setMode(pId);
                                                } else {
                                                    Ext.toast({
                                                        html: `<span style="color: red;">请选择至少一条数据!</span>`,
                                                        autoClose: true,
                                                        align: 't',
                                                        slideDUration: 400,
                                                        maxWidth: 400
                                                    });
                                                    return;
                                                }
                                                Ext.getBody().mask('切换中...');
                                                this.up('window').close();
                                                const root = Ext.getCmp('panel-model').getRootNode();
                                                root.removeAll();
                                                root.appendChild(data.getData(pId));
                                                history.removeAll();
                                                Ext.getCmp('panel-model').setTitle(row.data.text);
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
                                                Ext.getBody().unmask();
                                                showToast('[info] 切换模板为:' + row.data.text);
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
                                                    root.appendChild(data.getData(pId));
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
                                        icon: 'images/add-file.png',
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
                                            icon: 'images/folder_add.png',
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
                                            icon: 'images/set-file.png',
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
                                                        items: [{
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
                                            text: '修改',
                                            icon: 'images/table_edit.png',
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
                                            icon: 'images/cross.png',
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
                                        Ext.getBody().mask('执行中...');
                                        const files = [],
                                            generatorData = geFileData.getFileData(pId);
                                        generatorData.forEach(f => {
                                            if (!utils.isEmpty(f.file) && !utils.isEmpty(f.content)) {
                                                const type = fileData.getFile(f.id).updateType;
                                                const allModuleData = controlData.getModuleData(pId);
                                                const tpl = swig.compile(f.file);
                                                f.name = tpl(allModuleData);
                                                if (type == 'add') {
                                                    try {
                                                        const tplPre = swig.compile(f.content);
                                                        f.preview = tplPre(allModuleData);
                                                    } catch (e) {
                                                        console.error(e);
                                                        showErrorFlag();
                                                        showError(f.file + ':模板错误');
                                                        Ext.getBody().unmask();
                                                        throw e;
                                                    }
                                                } else {
                                                    const filePath = f.name.replace(/\\/g, '\/');
                                                    try {
                                                        f.preview = jsCode.runNodeJs(`const content = \`${require('fs').readFileSync(filePath, 'utf8').replace(/\$/g, '\\\$').replace(/\`/g, '\\\`')}\`;` + f.content);
                                                    } catch (e) {
                                                        console.error(e);
                                                        showError(e);
                                                        showErrorFlag();
                                                        Ext.getBody().unmask();
                                                        throw e;
                                                    }
                                                }
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
                                        Ext.getBody().unmask();
                                        Ext.create('Ext.window.Window', {
                                            title: '生成文件',
                                            fixed: true,
                                            maxHeight: 500,
                                            width: 500,
                                            layout: 'fit',
                                            resizable: true,
                                            constrain: true,
                                            animateTarget: this,
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
                                                    boxLabel: `<img src="images/before.svg" style="width: 16px;"/>`
                                                }, '-',
                                                {
                                                    xtype: 'checkbox',
                                                    bind: '{after}',
                                                    fieldLabel: '执行创建后脚本',
                                                    name: 'after',
                                                    boxLabel: `<img src="images/after.svg" style="width: 16px;"/>`
                                                }
                                            ],
                                            items: {
                                                xtype: 'grid',
                                                layout: 'fit',
                                                selType: 'checkboxmodel',
                                                columnLines: true,
                                                enableLocking: true,
                                                store: Ext.create('Ext.data.Store', {
                                                    data: files
                                                }),
                                                plugins: [{
                                                    ptype: 'rowexpander',
                                                    rowBodyTpl: ['<p><b>名称:</b> {file}</p>', '<p><b>文件:</b> {name}</p>']
                                                }],
                                                columns: [
                                                    new Ext.grid.RowNumberer(),
                                                    {text: '名称', align: 'center', dataIndex: 'name', flex: 1},
                                                    {
                                                        text: '是否存在',
                                                        align: 'center',
                                                        dataIndex: 'flag',
                                                        width: 80,
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
                                                        const {before, after} = this.up('window').getViewModel().getData();
                                                        this.up('window').close();
                                                        Ext.getBody().mask('执行中...');
                                                        closeNodeWin();
                                                        const grid = this.up('window').down('grid');
                                                        const selected = grid.getSelectionModel().getSelection();
                                                        if (before) {
                                                            nodeRun('(function(){' + geFileData.getBeforeShell(pId) + '})();').then(d => {
                                                                showToast('[info] 创建前JS脚本执行成功');
                                                                selected.map(row => {
                                                                    const f = row.data;
                                                                    utils.createFile(f.name, f.preview);
                                                                    showToast('[info] ' + f.name + ' 生成成功!');
                                                                });
                                                                showToast('[info] 文件创建完成');
                                                                if (after) {
                                                                    nodeRun('(function(){' + geFileData.getShell(pId) + '})();').then(d => {
                                                                        showToast('[info] 创建后JS脚本执行成功');
                                                                        Ext.getBody().unmask();
                                                                    }).catch(e => {
                                                                        console.error(e);
                                                                        showError(e);
                                                                        showErrorFlag();
                                                                        Ext.getBody().unmask();
                                                                    });
                                                                } else {
                                                                    Ext.getBody().unmask();
                                                                }
                                                            }).catch(e => {
                                                                console.error(e);
                                                                showError(e);
                                                                showErrorFlag();
                                                                Ext.getBody().unmask();
                                                            });
                                                        } else {
                                                            selected.map(row => {
                                                                const f = row.data;
                                                                utils.createFile(f.name, f.preview);
                                                                showToast('[info] ' + f.name + ' 生成成功!');
                                                            });
                                                            showToast('[info] 文件创建完成');
                                                            if (after) {
                                                                nodeRun('(function(){' + geFileData.getShell(pId) + '})();').then(d => {
                                                                    showToast('[info] 创建后JS脚本执行成功');
                                                                    Ext.getBody().unmask();
                                                                }).catch(e => {
                                                                    console.error(e);
                                                                    showError(e);
                                                                    showErrorFlag();
                                                                    Ext.getBody().unmask();
                                                                });
                                                            } else {
                                                                Ext.getBody().unmask();
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
                                                    icon: 'images/cog_add.png',
                                                    handler: function () {
                                                        if (pId == undefined || pId == null || pId.trim().length == 0) {
                                                            showToast('请先[选择模板]或[创建模板]!');
                                                            return;
                                                        }
                                                        addbutton('swig-template', 'swig-template', './images/cog_add.png', 'Swig配置', {});
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
            }]
        });

        Ext.create('Ext.Viewport', {
            layout: 'fit',
            items: viewport
        });

        ipcRenderer.send('loading-msg', '缓存加载中...');

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
        Ext.getCmp('mainmenutab').setActiveTab(Ext.getCmp(showTab));
        ipcRenderer.send('loading-success', '加载完成!');
    }
});

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
    Ext.getCmp('console').setValue(s);
}

function showError(s) {
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
