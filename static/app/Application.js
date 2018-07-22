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

Ext.application({
    requires: ['Ext.container.Viewport'],
    name: 'MyAppNamespace',
    appFolder: 'app',
    controllers: [ 'Mode', 'Editor', 'Code', 'Pkg', 'Unpkg', 'Minicode', 'Welcome','Generate', 'Templet'],
    launch: function () {
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
        const viewport = Ext.create('Ext.Viewport', {
            id: 'border-example',
            layout: 'border',
            items: [{
                region: 'west',
                title: '系统菜单',
                split: true,
                width: 220,
                minWidth: 160,
                maxWidth: 400,
                collapsible: true,
                margins: '0 0 0 0',
                layout: 'accordion',
                tools: [{
                    type: 'plus',
                    qtip: '定义js脚本',
                    listeners: {
                        click: function () {
                            jsCode.createFolder(pId);
                            Ext.create('Ext.window.Window', {
                                title: '编辑脚本',
                                height: 400,
                                width: 600,
                                maximized: true,
                                resizable: true,
                                maximizable: true,
                                minimizable: false,
                                constrain: true,
                                modal: true,
                                animateTarget: this,
                                layout: 'fit',
                                items: {
                                    xtype: 'editor',
                                    pId: pId
                                },
                                buttonAlign: 'center'
                            }).show().focus();
                        }
                    }
                }],
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
                            addbutton(item, 'mode', icon, title, {});
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
                        qtip: '切换模板',
                        renderTpl: [
                            '<div id="{id}-toolEl" class="x-tool-tool-el x-tool-img-tag" role="presentation"></div>'
                        ],
                        listeners: {
                            click: function () {
                                Ext.create('Ext.window.Window', {
                                    title: '选择模板',
                                    width: 400,
                                    layout: 'fit',
                                    fixed: true,
                                    animateTarget: this,
                                    resizable: false,
                                    constrain: true,
                                    modal: true,
                                    items: {
                                        xtype: 'combobox',
                                        fieldLabel: '名称',
                                        margin: '10',
                                        labelWidth: 45,
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
                                            }
                                            this.up('window').close();
                                            const root = Ext.getCmp('panel-model').getRootNode();
                                            while (root.firstChild) {
                                                root.removeChild(root.firstChild);
                                            }
                                            root.appendChild(data.getData(pId));
                                            history.removeAll();
                                            Ext.getCmp('panel-model').setTitle(row.data.text);
                                            Ext.getCmp('mainmenutab').removeAll();
                                            getFilesData();
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
                        }
                    },
                        {
                            qtip: '保存模板',
                            renderTpl: [
                                '<div id="{id}-toolEl" class="x-tool-tool-el x-tool-img-save" role="presentation"></div>'
                            ],
                            listeners: {
                                click: function () {
                                    showPrompt('模板名称', '', function (text) {
                                        pId = parentData.setData(text);
                                        moduleId = pId;
                                        history.setMode(pId);
                                        const root = Ext.getCmp('panel-model').getRootNode();
                                        while (root.firstChild) {
                                            root.removeChild(root.firstChild);
                                        }
                                        root.appendChild(data.getData(pId));
                                        Ext.getCmp('panel-model').setTitle(text);
                                    }, this);
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
                                    if (pId === null) {
                                        showToast('请先设置模板名称');
                                        showPrompt('模板名称', '', function (text) {
                                            pId = parentData.setData(text);
                                            moduleId = pId;
                                        }, this);
                                        return;
                                    }
                                    const modes = data.getData(pId);
                                    Ext.create('Ext.window.Window', {
                                        title: '模板详情名称',
                                        fixed: true,
                                        width: 400,
                                        layout: 'fit',
                                        animateTarget: this,
                                        resizable: false,
                                        constrain: true,
                                        modal: true,
                                        items: {
                                            xtype: 'combobox',
                                            fieldLabel: '名称',
                                            margin: '10',
                                            labelWidth: 45,
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
                                                while (root.firstChild) {
                                                    root.removeChild(root.firstChild);
                                                }
                                                root.appendChild(data.getData(pId));
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
                        itemdblclick: function (node, event) {
                            const item = event.data.id;
                            const icon = event.data.icon;
                            const title = event.data.text;
                            const type = event.data.type;
                            if (type == 'file' && event.childNodes.length == 0) {
                                addbutton(item, 'generate', icon, title, {
                                    updateType: event.get('updateType'),
                                    path: event.get('folder') + '\\' + title,
                                    folder: event.get('folder'),
                                    file: title,
                                    fileId: event.get('id')
                                });
                            }
                        },
                        afteritemexpand: function (node, index, item, eOpts) {
                            while (node.firstChild) {
                                node.removeChild(node.firstChild);
                            }
                            const child = fileData.getFiles(pId, node.data.id);
                            child.forEach(d => {
                                d.children = undefined;
                                d.loaded = false;
                                d.expanded = false;
                            });
                            node.appendChild(child);
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
                                    icon: 'images/add.png',
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
                                                                parentFolder: text,
                                                                rootId: id,
                                                                cls: type == 'update' ? 'color-blue' : '',
                                                                updateType: type,
                                                                pId: pId
                                                            };
                                                            const child = fileData.saveOrUpdate(data);
                                                            geFileData.save(child.id, pId);
                                                            record.appendChild(child);
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
                                },
                                    {
                                        text: '添加模板文件夹',
                                        icon: 'images/folder_add.png',
                                        hidden: type != 'file' ? false : true,
                                        handler: function () {
                                            showPrompt('模板文件', '', function (val) {
                                                const data = {
                                                    text: val,
                                                    type: 'folder',
                                                    folder: true,
                                                    parentFolder: text,
                                                    rootId: id,
                                                    pId: pId
                                                };
                                                const child = fileData.saveOrUpdate(data);
                                                record.appendChild(child);
                                            }, item);
                                        }
                                    },
                                    {
                                        text: '设置生成路径',
                                        hidden: type == 'file' ? false : true,
                                        icon: 'images/cog_add.png',
                                        handler: function () {
                                            const {file} = geFileData.getOneData(record.get('id'));
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
                                                buttons: [
                                                    {
                                                        text: '确定', handler: function () {
                                                            const form = this.up('window').down('form').getForm();
                                                            if (form.isValid()) {
                                                                const d = form.getValues();
                                                                geFileData.updateDataFile(record.get('id'), d.file);
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
                                            }, item);
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
                    tools: [{
                        renderTpl: [
                            '<div id="{id}-toolEl" class="x-tool-tool-el x-tool-img-add-file" role="presentation"></div>'
                        ],
                        qtip: '添加模板文件',
                        listeners: {
                            click: function () {
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
                                    const files = [], generatorData = geFileData.getFileData(pId);
                                    generatorData.forEach(f => {
                                        if (!utils.isEmpty(f.file) && !utils.isEmpty(f.content)) {
                                            const type = fileData.getFile(f.id).updateType;
                                            const allModuleData = controlData.getModuleData(pId);
                                            const tpl = swig.compile(f.file);
                                            f.name = tpl(allModuleData);
                                            if (type == 'add') {
                                                const tplPre = swig.compile(f.content);
                                                f.preview = tplPre(allModuleData);
                                            } else {
                                                const filePath = f.name.replace(/\//g, '\\').replace(/\\/g, '\\\\');
                                                try {
                                                    f.preview = jsCode.runNodeJs(`const content = \`${require('fs').readFileSync(filePath, 'utf8').replace(/\$/g, '\\\$').replace(/\`/g, '\\\`')}\`;` + f.content);
                                                } catch (e) {
                                                    showError(e);
                                                    throw e;
                                                }
                                            }
                                            f.type = type;
                                            files.push(f);
                                        }
                                    });
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
                                                rowBodyTpl: ['<p><b>名称:</b> {file}</p>','<p><b>文件:</b> {name}</p>']
                                            }],
                                            columns: [
                                                new Ext.grid.RowNumberer(),
                                                {text: '名称', align: 'center', dataIndex: 'name', flex: 1},
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
                                                    this.up('window').close();
                                                    Ext.getBody().mask('执行中...');
                                                    const grid = this.up('window').down('grid');
                                                    const selected = grid.getSelectionModel().getSelection();
                                                    selected.map(row => {
                                                        const f = row.data;
                                                        utils.createFile(f.name, f.preview);
                                                    });
                                                    Ext.getBody().unmask();
                                                    showToast('执行完成');
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
                        }
                    ]
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
                        history.setTab({
                            id: tab.config.id,
                            params: tab.config.params,
                            title: tab.config.title,
                            type: tab.config.xtype
                        });
                    },
                    remove: function (tabPanel, tab) {
                        history.removeTab(tab.config.id);
                        labelEditor.cancelEdit();
                    }
                }
            }]
        });

        function getFilesData() {
            let GfData = fileData.getFiles(pId, '0');
            GfData.forEach(d => {
                d.children = undefined;
                d.loaded = false;
                d.expanded = false;
            });
            const root = Ext.getCmp('ge-tree').getRootNode();
            while (root.firstChild) {
                root.removeChild(root.firstChild);
            }
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
                root.appendChild(child);
            }, btn, d.text);
        }

        const tabData = history.getTab();
        const showTab = history.getShowTab();
        for (let i = 0; i < tabData.length; i++) {
            openSome(tabData[i]);
        }
        Ext.getCmp('mainmenutab').setActiveTab(Ext.getCmp(showTab));
        Ext.getBody().addCls('loaded');
    }
});

function openSome({
                      id,
                      title,
                      type,
                      params
                  }) {
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
            params: params,
            xtype: type
        });
        tabPanel.setActiveTab(tab);
    }
}

function showToast(s) {
    Ext.toast({
        html: s,
        closable: false,
        align: 't',
        slideInDuration: 400
    });
}

function showError(s) {
    Ext.toast({
        html: `<span style="color: red;">${s}</span>`,
        closable: true,
        autoClose: false,
        align: 't',
        slideDUration: 400,
        maxWidth: 400
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