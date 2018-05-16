const data = require('../service/dao/modeData');
const parentData = require('../service/dao/mode');
const history = require('../service/dao/history');
const jsCode = require('../service/utils/JscodeUtil');
const systemConfig = require('../service/dao/system');
const packageConfig = require('../service/dao/package');

Ext.application({
    requires: ['Ext.container.Viewport'],

    // ****** 下面两行代码定义的变量很重要 *******
    /**
     * name 定义了这整个 MVC 应用的命名空间。
     * appFolder 定义了根目录。
     *
     * 在 https://docs.sencha.com/extjs/6.0/application_architecture/application_architecture.html 文档上有介绍。
     * 规则大概就是 <AppName>.<foldername>.<ClassAndFileName>
     */
    name: 'MyAppNamespace', // 定义的命名空间
    appFolder: 'app', // 指明应用的根目录

    /**
     * 下面的代码就是 MVC 的加载文件规则了。
     */
    // 其实翻译出来就是“从根 app 开始找 controller（注意没带 s 哦） 目录，在这个目录下加载 Students.js 这个文件”
    controllers: ['User', 'Mode', 'Editor', 'Code', 'Pkg', 'Unpkg', 'Minicode'],
    launch: function () {
        let pId = history.getMode();
        moduleId = pId;
        let store = Ext.create('Ext.data.TreeStore', {
            root: {
                expanded: true,
                text: '人员管理',
                children: data.getData(pId)
            }
        });
        let title = '数据模板';
        if (pId !== '') {
            title = parentData.getById(pId).text;
        }
        const d = [
            {text: "系统用户管理", leaf: true, uri: "studentlist", item: 'sysuser'},
            {text: "客户管理", leaf: true, uri: "useraa", item: 'khgl'},
            {text: "全类型参数测试", leaf: true, uri: "alltype", item: 'sycs'}
        ];
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
                            addbutton(item, 'mode', icon, title);
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
                                                text: '人员管理',
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
                                                        text: '人员管理',
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
                                            text: '人员管理',
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
                                                        text: '人员管理',
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
                    title: '生成文件',
                    store: store,
                    listeners: {
                        itemclick: function (node, event) {
                            var item = event.data.id;
                            var icon = event.data.icon;
                            var title = event.data.text;
                            addbutton(item, 'code', icon, title);
                        }
                    },
                    hideCollapseTool: true,
                    closable: false,
                    rootVisible: false,
                    tools: [
                        {
                            type: 'plus', qtip: '选择生成目录', listeners: {
                                click: function () {
                                    Ext.create('Ext.window.Window', {
                                        title: '选择生成目录',
                                        height: 120,
                                        width: 400,
                                        layout: 'fit',
                                        animateTarget: this,
                                        resizable: false,
                                        constrain: true,
                                        modal: true,
                                        items: {
                                            xtype: 'filefield',
                                            margin: '10',
                                            labelWidth: 45,
                                            fieldLabel: '文件夹',
                                            attr: 'webkitdirectory'
                                        },
                                        buttonAlign: 'center',
                                        buttons: [
                                            {
                                                text: '确定', handler: function () {
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
                        },
                        {
                            type: 'save', qtip: '测试编辑器', listeners: {
                                click: function () {
                                    Ext.create('Ext.window.Window', {
                                        title: '测试编辑器',
                                        height: 400,
                                        width: 600,
                                        maximized: false,
                                        resizable: true,
                                        maximizable: true,
                                        minimizable: true,
                                        constrain: true,
                                        modal: true,
                                        layout: 'fit',
                                        items: {
                                            xtype: 'pkg',
                                            pId: pId
                                        },
                                        buttonAlign: 'center'
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
                items: [{
                    id: 'sysuser',
                    title: '系统用户管理',
                    xtype: 'useraa'
                }]
            }]
        });

        function addbutton(item, url, icon, title) {
            var panel = "mainmenutab";
            var tabPanel = Ext.getCmp(panel);
            var taa = Ext.getCmp(item);
            if (taa) {
                tabPanel.setActiveTab(taa);
            } else {
                var tab = tabPanel.add({
                    id: item,
                    pId: pId,
                    title: title,
                    icon: icon,
                    closable: true,
                    xtype: url
                });
                tabPanel.setActiveTab(tab); // 设置当前tab页
            }
        }

        Ext.getBody().addCls('loaded');
    }
});

function openSet() {
    var panel = "mainmenutab";
    var tabPanel = Ext.getCmp(panel);
    var taa = Ext.getCmp('set-main');
    if (taa) {
        tabPanel.setActiveTab(taa);
    } else {
        var tab = tabPanel.add({
            id: 'set-main',
            title: '系统设置',
            closable: true,
            xtype: 'code'
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