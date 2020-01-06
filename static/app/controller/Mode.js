Ext.define('OnionSpace.controller.Mode', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Mode',
    pId: null,
    init: function () {
        this.control({
            'mode': {
                render: this.onPanelRendered
            },
            'toolbar button[action=add]': {
                click: this.add
            },
            'toolbar button[action=reload]': {
                click: this.reload
            },
            'toolbar button[action=sort]': {
                click: this.sort
            },
            'toolbar button[action=showHistory]': {
                click: this.showHistory
            }
        });
    },
    onPanelRendered: function (panel) {
        this.pId = panel.pId;
        const data = execute('controlData', 'getExt', [panel.id]),
            that = this;
        data.forEach(d => {
            panel.add(that.getDataModule(d.content, d.type, d.label, d.id, d.data));
        });
    },
    add: function (btn) {
        const that = this;
        const id = btn.up('mode').id;
        Ext.create('Ext.window.Window', {
            title: '添加变量',
            fixed: true,
            width: 400,
            layout: 'fit',
            animateTarget: btn,
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
                        margin: '10',
                        labelWidth: 60,
                        name: 'name',
                        allowBlank: false,
                        fieldLabel: '变量名'
                    },
                    {
                        xtype: 'combobox',
                        fieldLabel: '类型',
                        margin: '10',
                        labelWidth: 60,
                        store: {
                            fields: ['id', 'text'],
                            data: [
                                {
                                    id: 'text',
                                    text: '文本框'
                                },
                                {
                                    id: 'textarea',
                                    text: '多行文本框'
                                },
                                {
                                    id: 'combobox',
                                    text: '单选框'
                                },
                                {
                                    id: 'datalist',
                                    text: '单一集合'
                                },
                                {
                                    id: 'datagrid',
                                    text: '表格数据'
                                },
                                {
                                    id: 'minicode',
                                    text: '代码块'
                                },
                                {
                                    id: 'folder',
                                    text: '文件夹'
                                },
                                {
                                    id: 'file',
                                    text: '文件'
                                },
                                {
                                    id: 'json',
                                    text: 'JSON数据'
                                }
                            ]
                        },
                        name: 'type',
                        queryMode: 'local',
                        displayField: 'text',
                        valueField: 'id',
                        allowBlank: false,
                        listeners: {
                            select: function (combo, record) {
                                if (record.id == 'minicode') {
                                    this.up('form').add({
                                        xtype: 'combobox',
                                        id: 'combo-language',
                                        fieldLabel: '语言',
                                        margin: '10',
                                        labelWidth: 60,
                                        store: {
                                            fields: ['id', 'text'],
                                            data: languageType
                                        },
                                        name: 'language',
                                        queryMode: 'local',
                                        displayField: 'text',
                                        valueField: 'id',
                                        allowBlank: false
                                    });
                                } else {
                                    const dom = Ext.getCmp('combo-language');
                                    if (dom != undefined) {
                                        dom.destroy();
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            buttonAlign: 'center',
            buttons: [{
                text: '确定',
                handler: function () {
                    const form = this.up('window').down('form').getForm();
                    if (form.isValid()) {
                        const moduleData = execute('controlData', 'getModuleData', [that.pId]);
                        const {
                            type,
                            name,
                            language
                        } = form.getValues();
                        if (moduleData[name] != undefined) {
                            showToast(`已存在[${name}]!`);
                        } else {
                            btn.up('panel').add(that.getComponent(type, name, id, language));
                            const d = {};
                            if (type == 'json') {
                                d[name] = `JSON: ${name}`;
                            } else if (type == 'datagrid') {
                                d[name] = `ArrayJSON: ${name}`;
                            } else {
                                d[name] = `String: ${name}`;
                            }
                            registerSingleData(d);
                            this.up('window').close();
                        }
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
    },
    getComponent(type, label, id, language) {
        let content = {};
        if (type == 'text') {
            content = {
                xtype: 'textfield',
                flex: 1
            };
        } else if (type == 'textarea') {
            content = {
                xtype: 'textareafield',
                flex: 1
            };
        } else if (type == 'combobox') {
            content = {
                xtype: 'combobox',
                queryMode: 'local',
                displayField: 'text',
                valueField: 'id',
                flex: 1
            };
        } else if (type == 'datalist') {
            content = {
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
                columns: [{
                    xtype: 'treecolumn',
                    dataIndex: 'text',
                    flex: 1,
                    editor: {
                        xtype: 'textfield',
                        allowBlank: false,
                        allowOnlyWhitespace: false
                    }
                }],
                style: {
                    border: '1px solid #c2c2c2'
                }
            };
        } else if (type == 'datagrid') {
            content = {
                xtype: 'grid',
                flex: 1,
                style: {
                    border: '1px solid #c2c2c2'
                },
                plugins: {
                    ptype: 'rowediting',
                    clicksToMoveEditor: 1,
                    autoUpdate: true,
                    autoCancel: false
                },
                columns: []
            };
        } else if (type == 'file') {
            content = {
                xtype: 'filefield',
                flex: 1
            };
        } else if (type == 'folder') {
            content = {
                xtype: 'filefield',
                flex: 1,
                attr: 'webkitdirectory'
            };
        } else if (type == 'json') {
            content = {
                xtype: 'propertygrid',
                flex: 1
            };
        } else {
            content = {
                xtype: 'panel',
                flex: 1,
                height: 100,
                layout: 'fit',
                style: {
                    border: '1px solid #c2c2c2'
                },
                items: {
                    language: language,
                    xtype: 'minicode'
                }
            };
        }
        const bId = getUUID();
        execute('controlData', 'setExt', [{
            cId: id,
            content: content,
            type: type,
            label: label,
            id: bId,
            pId: this.pId
        }]);
        return this.getDataModule(content, type, label, bId, null);
    },
    getDataModule(content, type, label, id, value) {
        const that = this;
        content = JSON.parse(JSON.stringify(content));
        if (type == 'text') {
            content.listeners = {
                change: function (dom, val) {
                    execute('controlData', 'setDataValue', [id, val]);
                }
            };
            content.value = value;
        } else if (type == 'textarea') {
            content.listeners = {
                change: function (dom, val) {
                    execute('controlData', 'setDataValue', [that.pId]);
                }
            };
            content.value = value;
        } else if (type == 'combobox') {
            content.tpl = new Ext.XTemplate(
                '<ul class="x-list-plain">',
                '<tpl for=".">',
                '<li class="x-boundlist-item">',
                '{[values.text.encodeHtml()]}',
                '</li>',
                '</tpl>',
                '</ul>'
            );
            content.listeners = {
                change: function (dom, val) {
                    execute('controlData', 'setDataValue', [id, {value: val, data: that.getStoreData(dom.getStore())}]);
                }
            };
            if (value && value != null && value != '') {
                content.store = Ext.create('Ext.data.Store', {
                    fields: ['id', 'text'],
                    data: value.data
                });
                content.value = value.value;
            }
        } else if (type == 'datalist') {
            const data = [];
            if (value instanceof Array) {
                value.forEach(v => {
                    data.push({
                        text: v,
                        leaf: true,
                        cls: 'x-tree-no-icon'
                    })
                });
            }
            content.store = Ext.create('Ext.data.TreeStore', {
                root: {
                    expanded: true,
                    children: data
                },
                listeners: {
                    datachanged: function (store) {
                        execute('controlData', 'setDataValue', [id, that.getListData(store)]);
                    }
                }
            });
            content.plugins.listeners = {
                edit: function (editor, e, eOpts) {
                    e.record.commit();
                    execute('controlData', 'setDataValue', [id, that.getListData(editor.grid.getStore())]);
                }
            };
        } else if (type == 'datagrid') {
            const data = [],
                fields = [],
                columns = [new Ext.grid.RowNumberer()];
            if (value instanceof Array) {
                value.forEach((v, i) => {
                    data.push(v);
                    if (i == 0) {
                        for (let key in v) {
                            if (key != null && key == '操作') {
                                const {width, html} = v[key];
                                columns.push({
                                    width: width,
                                    text: '操作',
                                    sortable: false,
                                    align: 'center',
                                    renderer: function (v) {
                                        return html;
                                    }
                                });
                            } else {
                                if (key == 'id' && v[key].substring(0, 8) == 'extModel') {
                                    continue;
                                }
                                fields.push(key);
                                columns.push({
                                    text: key,
                                    align: 'center',
                                    dataIndex: key,
                                    editor: {
                                        xtype: 'textfield'
                                    },
                                    flex: 1
                                });
                            }
                        }
                    }
                });
            }
            content.store = Ext.create('Ext.data.Store', {
                fields: fields,
                data: data,
                listeners: {
                    datachanged: function (store) {
                        execute('controlData', 'setDataValue', [id, that.getGridData(store)]);
                    }
                }
            });
            content.columns = columns;
            content.plugins.listeners = {
                edit: function (editor, e, eOpts) {
                    e.record.commit();
                    execute('controlData', 'setDataValue', [id, that.getGridData(editor.grid.getStore())]);
                }
            };
        } else if (type == 'file') {
            content = {
                xtype: 'container',
                flex: 1,
                layout: 'hbox',
                items: [
                    {
                        xtype: 'textfield',
                        value: value,
                        flex: 1,
                        listeners: {
                            change: function (dom, val) {
                                execute('controlData', 'setDataValue', [id, val]);
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        text: '选择文件',
                        handler: function (btn) {
                            const remote = require('electron').remote;
                            const dialog = remote.dialog;
                            dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openFile']}).then(({canceled, filePaths}) => {
                                if (!canceled && filePaths != undefined && !utils.isEmpty(filePaths[0])) {
                                    btn.up('container').down('textfield').setRawValue(filePaths[0]);
                                    execute('controlData', 'setDataValue', [id, filePaths[0]]);
                                }
                            });
                        }
                    }
                ]
            };
        } else if (type == 'folder') {
            content = {
                xtype: 'container',
                flex: 1,
                layout: 'hbox',
                items: [
                    {
                        xtype: 'textfield',
                        value: value,
                        flex: 1,
                        listeners: {
                            change: function (dom, val) {
                                execute('controlData', 'setDataValue', [id, val]);
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        text: '选择文件夹',
                        handler: function (btn) {
                            const remote = require('electron').remote;
                            const dialog = remote.dialog;
                            dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openDirectory']}).then(({canceled, filePaths}) => {
                                if (!canceled && filePaths != undefined && !utils.isEmpty(filePaths[0])) {
                                    btn.up('container').down('textfield').setRawValue(filePaths[0]);
                                    execute('controlData', 'setDataValue', [id, filePaths[0]]);
                                }
                            });
                        }
                    }
                ]
            };
        } else if (type == 'json') {
            content.source = value;
            content.listeners = {
                propertychange: function (dom, recordId, val) {
                    execute('controlData', 'setDataValue', [id, that.getGridJsonData(this.getStore())]);
                }
            };
        } else {
            content.items.changeValue = function () {
                execute('controlData', 'setDataValue', [id, this.codeEditor.getValue()]);
            };
            content.items.value = value;
        }
        return {
            xtype: 'container',
            cls: 'mode-content',
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
                        text: label,
                        width: 105,
                        margin: {
                            top: 3
                        },
                        listeners: {
                            'render': function () {
                                this.el.on('dblclick', function (e, t) {
                                    labelEditor.startEdit(t);
                                    labelEditor.field.focus(50, true);
                                    editLabelId = id;
                                });
                            }
                        }
                    }, content]
                },
                {
                    xtype: 'button',
                    icon: 'images/javascript.svg',
                    tooltip: '从js脚本取值',
                    bId: id,
                    id: id,
                    bType: type,
                    handler: function (btn) {
                        that.getJavaScriptData(btn);
                    }
                },
                {
                    xtype: 'button',
                    icon: 'images/cancel.svg',
                    tooltip: '删除',
                    bId: id,
                    handler: function (btn) {
                        that.deleteData(btn);
                    }
                }
            ]
        }
    },
    getJavaScriptData(btn) {
        const val = execute('controlData', 'getCode', [btn.bId]),
            that = this,
            cId = btn.up('mode').id;
        let v = null;
        if (val != undefined && val != null) {
            v = val.value;
        }
        Ext.create('Ext.window.Window', {
            title: '使用脚本',
            height: 160,
            width: 400,
            layout: 'fit',
            resizable: true,
            constrain: true,
            animateTarget: btn,
            modal: true,
            tools: [{
                type: 'help',
                tooltip: '帮助说明',
                handler: function (event, toolEl, panel) {
                    showHelpFile('模板/UseScript.md', '使用脚本说明', toolEl);
                }
            }],
            items: {
                value: v,
                xtype: 'minicode'
            },
            buttonAlign: 'center',
            buttons: [{
                text: '确定',
                handler: function () {
                    const valStr = this.up('window').down('minicode').codeEditor.getValue();
                    this.up('window').close();
                    that.getCodeData(valStr, btn.bId, cId);
                }
            }, {
                text: '取消',
                handler: function () {
                    this.up('window').close();
                }
            }]
        }).show().focus();
    },
    deleteData(btn) {
        showConfirm('是否删除?', function () {
            btn.up('container').destroy();
            execute('controlData', 'removeExt', [btn.bId]);
            execute('controlData', 'removeCode', [btn.bId]);
        }, btn, Ext.MessageBox.ERROR);
    },
    getStoreData(store) {
        const data = store.getData(),
            list = [];
        data.items.forEach(d => {
            list.push(d.data);
        });
        return list;
    },
    getListData(store) {
        const data = store.getData(),
            list = [];
        data.items.forEach(d => {
            list.push(d.data.text);
        });
        return list;
    },
    getGridData(store) {
        const data = store.getData(),
            list = [],
            fields = store.getModel().getFields(),
            noFields = [];
        fields.forEach(f => {
            if (f.generated) {
                noFields.push(f.name);
            }
        });
        data.items.forEach(d => {
            const row = d.data;
            noFields.forEach(f => {
                delete row[f];
            });
            list.push(row);
        });
        return list;
    },
    getGridJsonData(store) {
        const data = store.getData(),
            list = {};
        data.items.forEach(d => {
            list[d.data.name] = d.data.value;
        });
        return list;
    },
    showHistory(btn) {
        const that = this,
            id = btn.up('mode').id;
        Ext.create('Ext.window.Window', {
            title: '历史数据',
            width: '85%',
            height: '85%',
            layout: 'fit',
            resizable: true,
            maximizable: true,
            constrain: true,
            animateTarget: btn,
            modal: true,
            tbar: [
                {
                    xtype: 'button',
                    text: '删除',
                    icon: 'images/cross.svg',
                    handler: function (b) {
                        const grid = b.up('window').down('grid');
                        const sm = grid.getSelectionModel().getSelection();
                        if (sm.length == 0) {
                            Ext.toast({
                                html: `<span style="color: red;">请选择至少一条数据!</span>`,
                                closable: true,
                                autoClose: false,
                                align: 't',
                                slideDUration: 400,
                                maxWidth: 400
                            });
                            return;
                        }
                        showConfirm(`是否删除${sm.length}条历史数据?`, function (text) {
                            sm.map(d => {
                                runMethod('modeDataDao', 'deleteById', [d.data.id]).then(() => {
                                    runMethod('modeDataDao', 'getAll', [{pId: that.pId, modeId: id}]).then(data => {
                                        const list = [];
                                        data.forEach(({dataValues}) => {
                                            dataValues.detail = JSON.stringify(dataValues.content, null, "\t");
                                            dataValues.content = JSON.stringify(dataValues.content);
                                            list.push(dataValues);
                                        });
                                        b.up('window').down('grid').store.setData(list);
                                    });
                                });
                            });
                        }, b, Ext.MessageBox.ERROR);
                    }
                }, {
                    xtype: 'button',
                    text: '清空历史数据',
                    icon: 'images/delete.svg',
                    handler: function (b) {
                        showConfirm(`是否删除(包括其它模板)所有历史数据?`, function () {
                            runMethod('modeDataDao', 'clearAll').then(() => {
                                runMethod('modeDataDao', 'getAll', [{pId: that.pId, modeId: id}]).then(data => {
                                    const list = [];
                                    data.forEach(({dataValues}) => {
                                        dataValues.detail = JSON.stringify(dataValues.content, null, "\t");
                                        dataValues.content = JSON.stringify(dataValues.content);
                                        list.push(dataValues);
                                    });
                                    b.up('window').down('grid').store.setData(list);
                                });
                            });
                        }, b, Ext.MessageBox.ERROR);
                    }
                }
            ],
            items: {
                xtype: 'grid',
                layout: 'fit',
                selType: 'checkboxmodel',
                columnLines: true,
                maxHeight: 600,
                store: Ext.create('Ext.data.Store', {
                    data: []
                }),
                columns: [
                    new Ext.grid.RowNumberer(),
                    {text: '操作日期', align: 'center', dataIndex: 'date', width: 180},
                    {text: '操作结果', align: 'center', dataIndex: 'content', flex: 1},
                    {
                        xtype: 'actioncolumn',
                        width: 60,
                        text: '操作',
                        sortable: false,
                        align: 'center',
                        items: [{
                            icon: 'images/cross.svg',
                            tooltip: '删除',
                            handler: function (grid, recIndex, cellIndex, item, e, {data}) {
                                showConfirm(`是否删除${data.date},历史记录?`, function (text) {
                                    runMethod('modeDataDao', 'deleteById', [data.id]).then(() => {
                                        const list = [];
                                        runMethod('modeDataDao', 'getAll', [{pId: that.pId, modeId: id}]).then(data => {
                                            data.forEach(({dataValues}) => {
                                                dataValues.detail = JSON.stringify(dataValues.content, null, "\t");
                                                dataValues.content = JSON.stringify(dataValues.content);
                                                list.push(dataValues);
                                            });
                                            grid.store.setData(list);
                                        });
                                    });
                                }, e.target, Ext.MessageBox.ERROR);
                            }
                        }, {
                            icon: 'images/view.svg',
                            tooltip: '查看详情',
                            handler: function (view, recIndex, cellIndex, item, e, {data}) {
                                Ext.create('Ext.window.Window', {
                                    title: '数据详情',
                                    width: '75%',
                                    height: '75%',
                                    layout: 'fit',
                                    resizable: true,
                                    maximizable: true,
                                    constrain: true,
                                    animateTarget: e.target,
                                    modal: true,
                                    items: {
                                        language: 'json',
                                        xtype: 'minicode',
                                        minimap: true,
                                        value: data.detail
                                    },
                                    buttons: [
                                        {
                                            text: '关闭', handler: function () {
                                                this.up('window').close();
                                            }
                                        }
                                    ]
                                }).show().focus();
                            }
                        }]
                    }
                ],
                listeners: {
                    render: function (grid) {
                        runMethod('modeDataDao', 'getAll', [{pId: that.pId, modeId: id}]).then(data => {
                            const list = [];
                            data.forEach(({dataValues}) => {
                                dataValues.detail = JSON.stringify(dataValues.content, null, "\t");
                                dataValues.content = JSON.stringify(dataValues.content);
                                list.push(dataValues);
                            });
                            grid.getStore().setData(list);
                        });
                    }
                }
            },
            buttons: [
                {
                    text: '关闭', handler: function () {
                        this.up('window').close();
                    }
                }
            ]
        }).show().focus();
    },
    sort(btn) {
        const that = this;
        const id = btn.up('mode').id;
        const data = execute('controlData', 'getExt', [id]);
        Ext.create('Ext.window.Window', {
            title: '排序',
            fixed: true,
            width: 300,
            maxHeight: 400,
            layout: 'fit',
            animateTarget: btn,
            resizable: false,
            constrain: true,
            modal: true,
            items: {
                xtype: 'grid',
                layout: 'fit',
                columnLines: true,
                viewConfig: {
                    plugins: {
                        ptype: 'gridviewdragdrop',
                        dragText: '拖动排序'
                    }
                },
                enableLocking: true,
                store: Ext.create('Ext.data.Store', {
                    data: data
                }),
                hideHeaders: true,
                columns: [
                    new Ext.grid.RowNumberer(),
                    {
                        text: '名称',
                        align: 'center',
                        dataIndex: 'label',
                        flex: 1
                    }
                ],
                buttonAlign: 'center',
                buttons: [{
                    text: '确定',
                    handler: function () {
                        const newData = this.up('window').down('grid').getStore().getData(),
                            sortData = [];
                        newData.items.forEach(d => {
                            sortData.push(d.data);
                        });
                        execute('controlData', 'sortExt', [sortData, id, that.pId]);
                        const panel = btn.up('mode');
                        panel.removeAll();
                        sortData.forEach(d => {
                            panel.add(that.getDataModule(d.content, d.type, d.label, d.id, d.data));
                        });
                        this.up('window').close();
                    }
                }, {
                    text: '取消',
                    handler: function () {
                        this.up('window').close();
                    }
                }]
            }
        }).show().focus();
    },
    reload(btn) {
        const that = this,
            id = btn.up('mode').id;
        showConfirm('是否重新获取数据?', function () {
            Ext.getCmp('main-content').mask('执行中...');
            const reData = [],
                conData = execute('controlData', 'getAllCode', [id]);
            closeNodeWin();
            conData.forEach(d => {
                if (d.value === undefined || d.value === null || d.value.toString().trim().length == 0) {
                    return;
                }
                try {
                    reData.push(that.getCodeValue(d.value, d.id, d.cId));
                    showToast('[info] 需要执行的脚本:' + d.value);
                } catch (e) {
                    console.error(e);
                    showError('[error] ' + e);
                    reData.push(null);
                    Ext.getCmp('main-content').unmask();
                }
            });
            if(reData.length == 0) {
                showToast('[error] 没有设置可执行的脚本!');
                Ext.getCmp('main-content').unmask();
                return;
            }
            Promise.all(reData).then(values => {
                const data = {};
                values.forEach((v, i) => {
                    const btn = Ext.getCmp(conData[i].id),
                        type = btn.bType;
                    data[btn.up('container').down('label').text] = v;
                    showToast('[success] 执行结果:' + JSON.stringify(v));
                    that.setComponentValue(type, btn, v);
                });
                runMethod('modeDataDao', 'create', [{
                    pId: that.pId,
                    content: data,
                    modeId: id,
                    date: utils.getNowTime()
                }]);
                Ext.getCmp('main-content').unmask();
            }).catch(e => {
                console.error(e);
                showError('[error] ' + e.toString());
                Ext.getCmp('main-content').unmask();
            });
        }, btn, Ext.MessageBox.QUESTION);
    },
    getCodeValue(valStr, bId, cId) {
        if (utils.isEmpty(valStr)) {
            execute('controlData', 'removeCode', [bId]);
            return;
        }
        execute('controlData', 'setCode', [bId, valStr, cId]);
        return nodeRun(valStr);
    },
    getCodeData(valStr, bId, cId) {
        if (utils.isEmpty(valStr)) {
            showToast('[error] 没有设置可执行的脚本!');
            return;
        }
        execute('controlData', 'setCode', [bId, valStr, cId]);
        Ext.getCmp('main-content').mask('执行中...');
        let d = '',
            btn = Ext.getCmp(bId),
            type = btn.bType;
        try {
            closeNodeWin();
            d = nodeRun(valStr);
        } catch (e) {
            console.error(e);
            showError(e);
            Ext.getCmp('main-content').unmask();
            throw e;
        }
        if (d instanceof Promise) {
            d.then(v => {
                showToast('[info] 需要执行的脚本:' + valStr);
                showToast('[success] 执行结果:' + JSON.stringify(v));
                this.setComponentValue(type, btn, v);
                Ext.getCmp('main-content').unmask();
            }).catch(e => {
                console.error(e);
                Ext.getCmp('main-content').unmask();
            });
        } else {
            showToast('[info] 需要执行的脚本:' + valStr);
            showToast('[success] 执行结果:' + JSON.stringify(d));
            this.setComponentValue(type, btn, d);
            Ext.getCmp('main-content').unmask();
        }
    },
    setComponentValue(type, btn, v) {
        if (type == 'text') {
            btn.up('container').down('textfield').setValue(v);
        } else if (type == 'textarea') {
            btn.up('container').down('textareafield').setValue(v);
        } else if (type == 'datalist') {
            const tree = btn.up('container').down('treepanel');
            const child = [];
            v.forEach(function (r) {
                child.push({
                    leaf: true,
                    cls: 'x-tree-no-icon',
                    text: r
                });
            });
            const root = tree.getRootNode();
            root.removeAll();
            root.appendChild(child);
        } else if (type == 'combobox') {
            const combo = btn.up('container').down('combobox');
            combo.setStore(Ext.create('Ext.data.Store', {
                fields: ['id', 'text'],
                data: v.data
            }));
            combo.setValue(v.value);
        } else if (type == 'datagrid') {
            const grid = btn.up('container').down('grid');
            const columns = [new Ext.grid.RowNumberer()],
                fields = [];
            if (v && v.length > 0) {
                const col = v[0];
                for (let key in col) {
                    if (key != null && key == '操作') {
                        const {width, html} = col[key];
                        columns.push({
                            width: width,
                            text: '操作',
                            sortable: false,
                            align: 'center',
                            renderer: function (v) {
                                return html;
                            }
                        });
                    } else {
                        if (key == 'id' && v[key].substring(0, 8) == 'extModel') {
                            continue;
                        }
                        fields.push(key);
                        columns.push({
                            text: key,
                            align: 'center',
                            dataIndex: key,
                            editor: {
                                xtype: 'textfield'
                            },
                            flex: 1
                        });
                    }
                }
            }
            const store = grid.getStore();
            store.setFields(fields);
            store.setData(v);
            grid.reconfigure(store, columns);
            if (v && v.length > 0) {
                const d = {};
                for (let k in v[0]) {
                    d[k] = `ArrayJSON: ... -> ${k}`;
                }
                registerSingleData(d);
            }
        } else if (type == 'file') {
            btn.up('container').down('filefield').setRawValue(v);
        } else if (type == 'folder') {
            btn.up('container').down('textfield').setRawValue(v);
        } else if (type == 'json') {
            const g = btn.up('container').down('propertygrid');
            g.setSource(v);
            const d = this.getGridJsonData(g.getStore());
            execute('controlData', 'setDataValue', [btn.bId, d]);
            const d1 = {};
            for (let k in d) {
                d1[k] = `JSON: ... -> ${k}`;
            }
            registerSingleData(d1);
        } else {

        }
    }
});
