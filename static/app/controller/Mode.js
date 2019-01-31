Ext.define('MyAppNamespace.controller.Mode', {
    extend: 'Ext.app.Controller',
    views: ['mode.mode'],
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
            }
        });
    },
    onPanelRendered: function (panel) {
        this.pId = panel.pId;
        const data = controlData.getExt(panel.id),
            that = this;
        data.forEach(d => {
            panel.add(Ext.create(that.getDataModule(d.content, d.type, d.label, d.id, d.data)));
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
                items: [{
                    xtype: 'textfield',
                    margin: '10',
                    labelWidth: 45,
                    name: 'name',
                    allowBlank: false,
                    fieldLabel: '变量名'
                },
                    {
                        xtype: 'combobox',
                        fieldLabel: '名称',
                        margin: '10',
                        labelWidth: 45,
                        store: {
                            fields: ['id', 'text'],
                            data: [{
                                id: 'text',
                                text: '文本框'
                            },
                                {
                                    id: 'textarea',
                                    text: '多行文本框'
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
                                    this.up('form').add(Ext.create({
                                        xtype: 'combobox',
                                        id: 'combo-language',
                                        fieldLabel: '语言',
                                        margin: '10',
                                        labelWidth: 45,
                                        store: {
                                            fields: ['id', 'text'],
                                            data: languageType
                                        },
                                        name: 'language',
                                        queryMode: 'local',
                                        displayField: 'text',
                                        valueField: 'id',
                                        allowBlank: false
                                    }));
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
                        const moduleData = controlData.getModuleData(that.pId);
                        const {
                            type,
                            name,
                            language
                        } = form.getValues();
                        if (moduleData[name] != undefined) {
                            showToast(`已存在[${name}]!`);
                        } else {
                            btn.up('panel').add(Ext.create(that.getComponent(type, name, id, language)));
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
        controlData.setExt({
            cId: id,
            content: content,
            type: type,
            label: label,
            id: bId,
            pId: this.pId
        });
        return this.getDataModule(content, type, label, bId, null);
    },
    getDataModule(content, type, label, id, value) {
        const that = this;
        content = JSON.parse(JSON.stringify(content));
        if (type == 'text') {
            content.listeners = {
                change: function (dom, val) {
                    controlData.setDataValue(id, val);
                }
            };
            content.value = value;
        } else if (type == 'textarea') {
            content.listeners = {
                change: function (dom, val) {
                    controlData.setDataValue(id, val);
                }
            };
            content.value = value;
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
                        controlData.setDataValue(id, that.getListData(store));
                    }
                }
            });
            content.plugins.listeners = {
                edit: function (editor, e, eOpts) {
                    e.record.commit();
                    controlData.setDataValue(id, that.getListData(editor.grid.getStore()));
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
                });
            }
            content.store = Ext.create('Ext.data.Store', {
                fields: fields,
                data: data,
                listeners: {
                    datachanged: function (store) {
                        controlData.setDataValue(id, that.getGridData(store));
                    }
                }
            });
            content.columns = columns;
            content.plugins.listeners = {
                edit: function (editor, e, eOpts) {
                    e.record.commit();
                    controlData.setDataValue(id, that.getGridData(editor.grid.getStore()));
                }
            };
        } else if (type == 'file') {
            content.listeners = {
                render: function (dom) {
                    dom.setRawValue(value);
                },
                change: function (dom, val) {
                    controlData.setDataValue(id, val);
                }
            };
        } else if (type == 'folder') {
            content.listeners = {
                render: function (dom) {
                    dom.setRawValue(value);
                },
                change: function (dom, val) {
                    controlData.setDataValue(id, val);
                }
            };
        } else if (type == 'json') {
            content.source = value;
            content.listeners = {
                propertychange: function (dom, recordId, val) {
                    controlData.setDataValue(id, that.getGridJsonData(this.getStore()));
                }
            };
        } else {
            content.items.changeValue = function () {
                controlData.setDataValue(id, this.codeEditor.getValue());
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
            items: [{
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
                    icon: 'images/script_code.png',
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
                    icon: 'images/cancel.png',
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
        const val = controlData.getCode(btn.bId),
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
            controlData.removeExt(btn.bId);
            controlData.removeCode(btn.bId);
        }, btn, Ext.MessageBox.ERROR);
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
    sort(btn) {
        const that = this;
        const id = btn.up('mode').id;
        const data = controlData.getExt(id);
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
                        controlData.sortExt(sortData, id, that.pId);
                        const panel = btn.up('mode');
                        panel.removeAll();
                        sortData.forEach(d => {
                            panel.add(Ext.create(that.getDataModule(d.content, d.type, d.label, d.id, d.data)));
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
            Ext.getBody().mask('执行中...');
            const reData = [],
                conData = controlData.getAllCode(id);
            conData.forEach(d => {
                try {
                    reData.push(that.getCodeValue(d.value, d.id, d.cId));
                } catch (e) {
                    reData.push(null);
                }
            });
            Promise.all(reData).then(values => {
                values.forEach((v, i) => {
                    const btn = Ext.getCmp(conData[i].id),
                        type = btn.bType;
                    that.setComponentValue(type, btn, v, id);
                });
                Ext.getBody().unmask();
            }).catch(e => {
                showError('错误:' + e.toString());
                Ext.getBody().unmask();
            });
        }, btn, Ext.MessageBox.QUESTION);
    },
    getCodeValue(valStr, bId, cId) {
        if (valStr.trim().length == 0) {
            controlData.removeCode(bId);
            return;
        }
        controlData.setCode(bId, valStr, cId);
        return eval(valStr);
    },
    getCodeData(valStr, bId, cId) {
        if (valStr.trim().length == 0) {
            controlData.removeCode(bId);
            return;
        }
        controlData.setCode(bId, valStr, cId);
        Ext.getBody().mask('执行中...');
        let d = '',
            btn = Ext.getCmp(bId),
            type = btn.bType;
        try {
            d = eval(valStr);
        } catch (e) {
            showError(e);
            Ext.getBody().unmask();
            throw e;
        }
        if (d instanceof Promise) {
            d.then(v => {
                this.setComponentValue(type, btn, v, bId);
                Ext.getBody().unmask();
            }).catch(e => {
                Ext.getBody().unmask();
            });
        } else {
            this.setComponentValue(type, btn, d, bId);
            Ext.getBody().unmask();
        }
    },
    setComponentValue(type, btn, v, bId) {
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
            while (root.firstChild) {
                root.removeChild(root.firstChild);
            }
            root.appendChild(child);
        } else if (type == 'datagrid') {
            const grid = btn.up('container').down('grid');
            const columns = [new Ext.grid.RowNumberer()],
                fields = [];
            if (v.length > 0) {
                const col = v[0];
                for (let key in col) {
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
            const store = grid.getStore();
            store.setFields(fields);
            store.setData(v);
            grid.reconfigure(store, columns);
            if (v.length > 0) {
                const d = {};
                for (let k in v[0]) {
                    d[k] = `ArrayJSON: ... -> ${k}`;
                }
                registerSingleData(d);
            }
        } else if (type == 'file') {
            btn.up('container').down('filefield').setRawValue(v);
        } else if (type == 'folder') {
            btn.up('container').down('filefield').setRawValue(v);
        } else if (type == 'json') {
            const g = btn.up('container').down('propertygrid');
            g.setSource(v);
            const d = this.getGridJsonData(g.getStore());
            controlData.setDataValue(bId, d);
            const d1 = {};
            for (let k in d) {
                d1[k] = `JSON: ... -> ${k}`;
            }
            registerSingleData(d1);
        } else {

        }
    }
});
