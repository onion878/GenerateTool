Ext.define('MyAppNamespace.controller.Mode', {
    extend: 'Ext.app.Controller',
    views: ['mode.mode'],
    init: function () {
        this.control({
            'viewport > panel': {
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
    onPanelRendered: function () {
        //console.debug('userpanel被渲染了');
    },
    add: function (btn) {
        const that = this;
        Ext.create('Ext.window.Window', {
            title: '添加变量',
            height: 180,
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
                        fieldLabel: '类型'
                    }
                ]
            },
            buttonAlign: 'center',
            buttons: [
                {
                    text: '确定', handler: function () {
                        const form = this.up('window').down('form').getForm();
                        if (form.isValid()) {
                            const {type, name} = form.getValues();
                            btn.up('panel').add(Ext.create(that.getComponent(type, name)));
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
    },
    save: function (btn) {
        showPrompt('模板名称', '', function (text) {
            eval(text);
        }, this);
    },
    getComponent(type, label) {
        const that = this;
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
                plugins: 'cellediting',
                viewConfig: {
                    plugins: {
                        ptype: 'gridviewdragdrop',
                        dragText: '拖动排序...'
                    }
                },
                tbar: [{
                    text: '添加',
                    icon: 'images/add.png'
                }, {
                    text: '删除',
                    icon: 'images/delete.png'
                }],
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
                    }],
                store: Ext.create('Ext.data.TreeStore', {
                    root: {
                        expanded: true
                    }
                }),
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
                viewConfig: {
                    plugins: {
                        ptype: 'gridviewdragdrop',
                        dragText: '拖动排序...'
                    }
                },
                tbar: [{
                    text: '编辑列',
                    icon: 'images/table_edit.png'
                }, {
                    text: '添加',
                    icon: 'images/add.png'
                }, {
                    text: '删除',
                    icon: 'images/delete.png'
                }],
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
                    xtype: 'minicode'
                }
            };
        }
        return that.getDataModule(content, type, label);
    },
    getDataModule(content, type, label) {
        const that = this;
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
                                });
                            }
                        }
                    }, content]
                },
                {
                    xtype: 'button',
                    icon: 'images/script_code.png',
                    tooltip: '从js脚本取值',
                    handler: function (btn) {
                        that.getJavaScriptData(btn, type);
                    }
                },
                {
                    xtype: 'button',
                    icon: 'images/cancel.png',
                    tooltip: '删除',
                    handler: function (btn) {
                        that.deleteData(btn);
                    }
                }
            ]
        }
    },
    getJavaScriptData(btn, type) {
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
                xtype: 'textareafield',
                margin: '10'
            },
            buttonAlign: 'center',
            buttons: [
                {
                    text: '确定', handler: function () {
                        const d = eval(this.up('window').down('textareafield').getRawValue());
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
                                    })
                                }
                            }
                            const store = Ext.create('Ext.data.Store', {
                                fields: fields,
                                data: d
                            });
                            grid.reconfigure(store, columns);
                            console.log(d);
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
        });
    }
});