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

Ext.application({
    requires: ['Ext.container.Viewport'],
    name: 'MyAppNamespace',
    appFolder: 'app',
    controllers: ['Welcome', 'Mode', 'Editor', 'Code', 'Pkg', 'Unpkg', 'Minicode', 'Generate'],
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
                                minimizable: true,
                                constrain: true,
                                modal: true,
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
                            var item = event.data.id;
                            var icon = event.data.icon;
                            var title = event.data.text;
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
                                        }, this);
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
                            type: 'down',
                            qtip: '切换模板',
                            listeners: {
                                click: function () {
                                    Ext.create('Ext.window.Window', {
                                        title: '选择模板',
                                        height: 120,
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
                                                data: parentData.getAll()
                                            },
                                            queryMode: 'local',
                                            displayField: 'text',
                                            valueField: 'id'
                                        },
                                        buttonAlign: 'center',
                                        buttons: [
                                            {
                                                text: '确定', handler: function () {
                                                    const combo = this.up('window').down('combobox');
                                                    const row = combo.getSelectedRecord();
                                                    if (row !== null) {
                                                        pId = row.id;
                                                        moduleId = pId;
                                                        history.setMode(pId);
                                                    }
                                                    this.up('window').close();
                                                    store.setRoot({
                                                        expanded: true,
                                                        text: '',
                                                        children: data.getData(pId)
                                                    });
                                                    Ext.getCmp('panel-model').setTitle(row.data.text);
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
                            type: 'save',
                            qtip: '保存模板',
                            listeners: {
                                click: function () {
                                    showPrompt('模板名称', '', function (text) {
                                        pId = parentData.setData(text);
                                        moduleId = pId;
                                        history.setMode(pId);
                                        store.setRoot({
                                            expanded: true,
                                            text: '',
                                            children: data.getData(pId)
                                        });
                                        Ext.getCmp('panel-model').setTitle(text);
                                    }, this);
                                }
                            }
                        },
                        {
                            type: 'plus', qtip: '添加模板详情', listeners: {
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
                                        title: '模板名称',
                                        height: 120,
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
                                        buttons: [
                                            {
                                                text: '确定', handler: function () {
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
                                                    store.setRoot({
                                                        expanded: true,
                                                        text: '',
                                                        children: data.getData(pId)
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
                            }
                        }
                    ]
                }, {
                    xtype: 'treepanel',
                    title: '生成模板',
                    store: fileStore,
                    id: 'ge-tree',
                    listeners: {
                        itemdblclick: function (node, event) {
                            var item = event.data.id;
                            var icon = event.data.icon;
                            var title = event.data.text;
                            if (event.childNodes.length == 0) {
                                addbutton(item, 'generate', icon, title, {
                                    path: event.get('folder') + '\\' + title,
                                    folder: event.get('folder'),
                                    file: title
                                });
                            }
                        },
                        itemcontextmenu: function (node, record, item, index, event, eOpts) {
                            if (record.childNodes.length > 0) {
                                new Ext.menu.Menu({
                                    minWidth: 60,
                                    items: [
                                        {
                                            text: '修改',
                                            icon: 'images/table_edit.png',
                                            handler: function () {
                                                addGeFiles(this, record.get('id'));
                                            }
                                        },
                                        {
                                            text: '删除',
                                            icon: 'images/cross.png',
                                            handler: function () {
                                                showConfirm(`是否删除[${record.data.text}]?`, function (text) {
                                                    record.parentNode.removeChild(record);
                                                    fileData.removeFile(record.get('id'));
                                                    geFileData.removeData(pId, record.get('text'));
                                                }, this);
                                            }
                                        }
                                    ]
                                }).showAt(event.getPoint());
                            }
                        }
                    },
                    hideCollapseTool: true,
                    closable: false,
                    checkPropagation: 'both',
                    useArrows: true,
                    rootVisible: false,
                    tools: [
                        {
                            type: 'plus', qtip: '设置生成文件', listeners: {
                                click: function () {
                                    addGeFiles(this);
                                }
                            }
                        },
                        {
                            type: 'save', qtip: '开始创建', listeners: {
                                click: function () {
                                    const records = Ext.getCmp('ge-tree').getView().getChecked(),
                                        files = [];
                                    Ext.Array.each(records, function (r) {
                                        if (r.childNodes.length == 0) {
                                            files.push(r.get('folder') + '\\' + r.get('text'));
                                        }
                                    });
                                    console.log(files);
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
            let GfData = fileData.getFiles(pId), data = [];
            GfData.forEach(function (d) {
                const child = [];
                d.files.forEach(function (e) {
                    child.push({
                        text: e,
                        checked: true,
                        folder: d.folder,
                        leaf: true
                    })
                });
                data.push({
                    text: d.folder,
                    id: d.id,
                    checked: true,
                    children: child
                });
            });
            const root = Ext.getCmp('ge-tree').getRootNode();
            while (root.firstChild) {
                root.removeChild(root.firstChild);
            }
            root.appendChild(data);
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

        function addGeFiles(btn, id) {
            let d = {};
            if (id != undefined) {
                d = fileData.getFile(id);
            }
            Ext.create('Ext.window.Window', {
                title: '设置生成文件',
                width: 400,
                fixed: true,
                layout: 'fit',
                resizable: false,
                animateTarget: btn,
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
                            xtype: 'filefield',
                            margin: '10',
                            labelWidth: 45,
                            name: 'folder',
                            allowBlank: false,
                            fieldLabel: '文件夹',
                            attr: 'webkitdirectory',
                            listeners: {
                                render: function () {
                                    this.setRawValue(d.folder);
                                }
                            }
                        },
                        {
                            xtype: 'textareafield',
                            margin: '10',
                            labelWidth: 45,
                            name: 'code',
                            value: d.code,
                            hidden: true,
                            fieldLabel: '代码块'
                        },
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            margin: {
                                left: 10,
                                right: 10,
                                bottom: 10
                            },
                            items: [
                                {
                                    xtype: 'container',
                                    flex: 1,
                                    layout: 'hbox',
                                    items: [{
                                        xtype: 'label',
                                        text: '文件名:',
                                        width: 50,
                                        name: 'fileName',
                                        margin: {
                                            top: 3
                                        }
                                    }, {
                                        xtype: 'treepanel',
                                        flex: 1,
                                        closable: false,
                                        rootVisible: false,
                                        hideCollapseTool: true,
                                        lines: false,
                                        plugins: {
                                            ptype: 'rowediting',
                                            clicksToMoveEditor: 1,
                                            autoUpdate: true,
                                            autoCancel: false
                                        },
                                        columns: [
                                            {
                                                xtype: 'treecolumn',
                                                dataIndex: 'text',
                                                flex: 1,
                                                editor: {
                                                    xtype: 'textfield',
                                                    allowBlank: false,
                                                    allowOnlyWhitespace: false
                                                }
                                            }
                                        ],
                                        style: {
                                            border: '1px solid #c2c2c2'
                                        },
                                        listeners: {
                                            render: function () {
                                                const f = d.files;
                                                const child = [];
                                                if (f instanceof Array) {
                                                    f.forEach(function (r) {
                                                        child.push({
                                                            leaf: true,
                                                            cls: 'x-tree-no-icon',
                                                            text: r
                                                        });
                                                    });
                                                }
                                                const root = this.getRootNode();
                                                while (root.firstChild) {
                                                    root.removeChild(root.firstChild);
                                                }
                                                root.appendChild(child);
                                            }
                                        }
                                    }]
                                },
                                {
                                    xtype: 'button',
                                    icon: 'images/script_code.png',
                                    tooltip: '从js脚本取值',
                                    bId: id,
                                    handler: function (btn) {
                                        const val = btn.up('window').down('textareafield').getValue();
                                        Ext.create('Ext.window.Window', {
                                            title: '使用脚本',
                                            height: 160,
                                            width: 400,
                                            layout: 'fit',
                                            animateTarget: this,
                                            resizable: true,
                                            constrain: true,
                                            modal: true,
                                            items: {
                                                xtype: 'minicode',
                                                value: val,
                                                changeValue: function () {
                                                    btn.up('window').down('textareafield').setValue(this.codeEditor.getValue());
                                                }
                                            },
                                            buttonAlign: 'center',
                                            buttons: [
                                                {
                                                    text: '确定', handler: function () {
                                                        const valStr = this.up('window').down('minicode').codeEditor.getValue();
                                                        const d = eval(valStr);
                                                        const tree = btn.up('container').down('treepanel');
                                                        const child = [];
                                                        if (d instanceof Array) {
                                                            d.forEach(function (r) {
                                                                child.push({
                                                                    leaf: true,
                                                                    cls: 'x-tree-no-icon',
                                                                    text: r
                                                                });
                                                            });
                                                        } else {
                                                            child.push({
                                                                leaf: true,
                                                                cls: 'x-tree-no-icon',
                                                                text: d
                                                            });
                                                        }
                                                        const root = tree.getRootNode();
                                                        while (root.firstChild) {
                                                            root.removeChild(root.firstChild);
                                                        }
                                                        root.appendChild(child);
                                                        this.up('window').close();
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
                                const {code} = form.getValues();
                                if (code.trim().length == 0) {
                                    showToast('请设置文件名!');
                                    return;
                                }
                                const data = this.up('window').down('treepanel').getStore().getData(),
                                    files = [];
                                data.items.forEach(function (d) {
                                    files.push(d.data.text);
                                });
                                const folder = this.up('window').down('filefield').getValue();
                                fileData.addFile(pId, folder, files, code, id);
                                this.up('window').close();
                                getFilesData();
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

        const tabData = history.getTab();
        const showTab = history.getShowTab();
        for (let i = 0; i < tabData.length; i++) {
            openSome(tabData[i]);
        }
        Ext.getCmp('mainmenutab').setActiveTab(Ext.getCmp(showTab));
        Ext.getBody().addCls('loaded');
    }
});

function openSome({id, title, type, params}) {
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

function showPrompt(title, msg, fn, dom) {
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
    if (fn !== undefined) options.fn = function (btn, text) {
        if (btn === 'ok')
            fn(text);
    };
    if (dom !== undefined) options.animateTarget = dom;
    Ext.MessageBox.show(options).focus();
}

function showConfirm(msg, fn, dom) {
    let options = {
        title: '提示',
        width: 300,
        msg: msg,
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