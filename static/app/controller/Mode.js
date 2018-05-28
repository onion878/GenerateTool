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
            'toolbar button[action=save]': {
                click: this.save
            }
        });
    },
    onPanelRendered: function (panel) {
        this.pId = panel.pId;
        const data = controlData.getExt(panel.id), that = this;
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
                items: [
                    {
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
                            data: [
                                {id: 'text', text: '文本框'},
                                {id: 'textarea', text: '多行文本框'},
                                {id: 'datalist', text: '单一集合'},
                                {id: 'datagrid', text: '表格数据'},
                                {id: 'minicode', text: '代码块'}
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
            buttons: [
                {
                    text: '确定', handler: function () {
                        const form = this.up('window').down('form').getForm();
                        if (form.isValid()) {
                            const moduleData = controlData.getModuleData(that.pId);
                            const {type, name, language} = form.getValues();
                            if (moduleData[name] != undefined) {
                                showToast(`已存在[${name}]!`);
                            } else {
                                btn.up('panel').add(Ext.create(that.getComponent(type, name, id, language)));
                                this.up('window').close();
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
    },
    save: function (btn) {
        showPrompt('模板名称', '', function (text) {
            eval(text);
        }, this);
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
        } else {
            content = {
                xtype: 'panel',
                flex: 1,
                height: 100,
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
        controlData.setExt({cId: id, content: content, type: type, label: label, id: bId, pId: this.pId});
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
            if (value != null) {
                value.forEach(v => {
                    data.push({text: v, leaf: true, cls: 'x-tree-no-icon'})
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
            const data = [], fields = [], columns = [new Ext.grid.RowNumberer()];
            if (value != null) {
                value.forEach((v, i) => {
                    data.push(v);
                    if (i == 0) {
                        for (let key in v) {
                            fields.push(key);
                            columns.push({
                                text: key,
                                align: 'center',
                                dataIndex: key,
                                editor: {xtype: 'textfield'},
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
        } else {
            content.items.changeValue = function () {
                controlData.setDataValue(id, this.codeEditor.getValue());
            };
            content.items.value = value;
        }
        return {
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
                    handler: function (btn) {
                        that.getJavaScriptData(btn, type);
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
    getJavaScriptData(btn, type) {
        const val = controlData.getCode(btn.bId);
        let v = null;
        if (val != undefined && val != null) {
            v = val.value;
        }
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
                value: v,
                xtype: 'minicode'
            },
            buttonAlign: 'center',
            buttons: [
                {
                    text: '确定', handler: function () {
                        const valStr = this.up('window').down('minicode').codeEditor.getValue();
                        controlData.setCode(btn.bId, valStr);
                        const d = eval(valStr);
                        if (type == 'text') {
                            btn.up('container').down('textfield').setValue(d);
                        } else if (type == 'textarea') {
                            btn.up('container').down('textareafield').setValue(d);
                        } else if (type == 'datalist') {
                            const tree = btn.up('container').down('treepanel');
                            const child = [];
                            d.forEach(function (r) {
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
                            const columns = [new Ext.grid.RowNumberer()], fields = [];
                            if (d.length > 0) {
                                const col = d[0];
                                for (let key in col) {
                                    fields.push(key);
                                    columns.push({
                                        text: key,
                                        align: 'center',
                                        dataIndex: key,
                                        editor: {xtype: 'textfield'},
                                        flex: 1
                                    });
                                }
                            }
                            const store = grid.getStore();
                            store.setFields(fields);
                            store.setData(d);
                            grid.reconfigure(store, columns);
                        } else {

                        }
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
    },
    deleteData(btn) {
        showConfirm('是否删除?', function () {
            btn.up('container').destroy();
            controlData.removeExt(btn.bId);
            controlData.removeCode(btn.bId);
        });
    },
    getListData(store) {
        const data = store.getData(), list = [];
        data.items.forEach(d => {
            list.push(d.data.text);
        });
        return list;
    },
    getGridData(store) {
        const data = store.getData(), list = [];
        data.items.forEach(d => {
            list.push(d.data);
        });
        return list;
    }
});