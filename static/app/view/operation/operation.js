Ext.define('OnionSpace.view.operation.operation', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.operation',
    requires: [
        'OnionSpace.controller.Operation'
    ],
    controller: 'Operation',
    tbar: [{
        xtype: 'button',
        text: '刷新',
        icon: 'images/refresh.svg',
        handler: 'refreshOperation'
    }, {
        xtype: 'button',
        text: '删除',
        icon: 'images/cross.svg',
        handler: 'deleteOperation'
    }, {
        xtype: 'button',
        text: '清空历史记录',
        icon: 'images/delete.svg',
        handler: 'clearAll'
    }, {
        xtype: 'combobox',
        fieldLabel: '按模板搜索',
        labelWidth: 90,
        flex: 1,
        store: {
            fields: ['id', 'text'],
            data: execute('parentData', 'getAll')
        },
        name: 'type',
        queryMode: 'local',
        displayField: 'text',
        valueField: 'id',
        listeners: {
            select: function (combo, record) {
                const grid = combo.up('operation');
                const list = [];
                runMethod('operation', 'getAll', [{pId: record.id}]).then(data => {
                    data.forEach(({dataValues}) => {
                        list.push(dataValues);
                    });
                    grid.getStore().setData(list);
                });
            }
        },
        triggers: {
            clear: {
                cls: 'x-form-clear-trigger',
                weight: -1,
                handler: function (d) {
                    d.clearValue();
                    const grid = d.up('operation');
                    const list = [];
                    runMethod('operation', 'getAll').then(data => {
                        data.forEach(({dataValues}) => {
                            list.push(dataValues);
                        });
                        grid.getStore().setData(list);
                    });
                }
            }
        }
    }],
    selType: 'checkboxmodel',
    plugins: [{
        ptype: 'rowexpander',
        rowBodyTpl: ['<p><b>错误信息:</b> {errMsg}</p>']
    }],
    initComponent: function () {
        const that = this;
        this.store = Ext.create('Ext.data.Store', {
            storeId: 'id',
            fields: ['pId', 'name', 'date', 'id'],
            sorters: [{
                property: 'date',
                direction: 'desc'
            }]
        });
        const list = [];
        runMethod('operation', 'getAll').then(data => {
            data.forEach(({dataValues}) => {
                list.push(dataValues);
            });
            this.store.setData(list);
        });
        this.columns = [
            new Ext.grid.RowNumberer(),
            {text: '名称', align: 'center', dataIndex: 'name', flex: 1},
            {text: '操作日期', align: 'center', dataIndex: 'date', flex: 1},
            {
                text: '操作结果', align: 'center', dataIndex: 'success', width: 90, renderer: val => {
                    if (val) {
                        return `<i title="生成成功" class="far fa-check-circle" style="color: lightseagreen"></i>`;
                    } else {
                        return `<i title="生成失败" class="far fa-exclamation" style="color: red"></i>`;
                    }
                }
            },
            {
                xtype: 'actioncolumn',
                width: 60,
                text: '操作',
                sortable: false,
                align: 'center',
                items: [{
                    icon: 'images/cross.svg',
                    tooltip: '删除',
                    handler: function (view, recIndex, cellIndex, item, e, {data}) {
                        showConfirm(`是否删除${data.name + data.date},历史记录?`, function (text) {
                            runMethod('operation', 'deleteById', [data.id]).then(() => {
                                const list = [];
                                runMethod('operation', 'getAll').then(data => {
                                    data.forEach(({dataValues}) => {
                                        list.push(dataValues);
                                    });
                                    that.store.setData(list);
                                });
                            });
                        }, e.target, Ext.MessageBox.ERROR);
                    }
                }, {
                    icon: 'images/undo.svg',
                    tooltip: '撤销操作',
                    handler: function (view, recIndex, cellIndex, item, e, {data}) {
                        showConfirm(`是否撤销${data.name + data.date}操作?`, function (text) {
                            runMethod('operationDetail', 'findDetail', [data.id]).then(d => {
                                d.forEach(({dataValues}) => {
                                    if (!dataValues.flag) {
                                        utils.unLinkFile(dataValues.file);
                                    } else {
                                        utils.createFile(dataValues.file, dataValues.oldContent);
                                    }
                                });
                            }).then(() => toast('撤销成功!'));
                        }, e.target, Ext.MessageBox.ERROR);
                    }
                }, {
                    icon: 'images/view.svg',
                    tooltip: '查看详情',
                    handler: function (view, recIndex, cellIndex, item, e, {data}) {
                        that.detail(data);
                    }
                }]
            }
        ];
        this.callParent(arguments);
    },
    detail: function (data) {
        Ext.create('Ext.window.Window', {
            title: '模板说明',
            width: '85%',
            height: '85%',
            layout: 'fit',
            resizable: true,
            maximizable: true,
            constrain: true,
            modal: true,
            listeners: {
                render: function () {
                    const list = [];
                    runMethod('operationDetail', 'findDetail', [data.id]).then(d => {
                        d.forEach(({dataValues}) => {
                            if (dataValues.oldContent !== null)
                                dataValues.oldHtml = dataValues.oldContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                            else
                                dataValues.oldHtml = null;
                            list.push(dataValues);
                        });
                        this.down('grid').getStore().setData(list);
                    });
                }
            },
            items: [{
                xtype: 'grid',
                store: Ext.create('Ext.data.Store', {
                    storeId: 'tempId',
                    fields: ['pId', 'date', 'type', 'file', 'tempId', 'content', 'oldContent'],
                    sorters: [{
                        property: 'date',
                        direction: 'desc'
                    }]
                }),
                plugins: [{
                    ptype: 'rowexpander',
                    rowBodyTpl: ['<p style="white-space: pre;"><b>原内容:</b><br/>{oldHtml}</p>']
                }],
                columns: [
                    new Ext.grid.RowNumberer(),
                    {text: '文件', align: 'center', dataIndex: 'file', flex: 1, tdCls: 'direction-rtl'},
                    {
                        text: '操作类型', align: 'center', dataIndex: 'type', width: 100,
                        renderer: function (value, metaData, record) {
                            if (!record.data.flag) {
                                return `<span>添加[${record.data.type}]</span>`;
                            }
                            return `<span style="color: lightgreen">修改[${record.data.type}]</span>`;
                        }
                    },
                    {
                        xtype: 'actioncolumn',
                        width: 60,
                        text: '操作',
                        sortable: false,
                        align: 'center',
                        items: [{
                            icon: 'images/undo.svg',
                            tooltip: '撤销操作',
                            handler: function (view, recIndex, cellIndex, item, e, {data}) {
                                showConfirm(`是否撤销<div style="direction: rtl;text-overflow: ellipsis;width: 100%;text-align: left;overflow: hidden;">${data.file}</div>${data.date}操作?`, function (text) {
                                    if (!data.flag) {
                                        utils.unLinkFile(data.file);
                                    } else {
                                        utils.createFile(data.file, data.oldContent);
                                    }
                                    toast('撤销成功!');
                                }, this, Ext.MessageBox.ERROR);
                            }
                        }]
                    }
                ]
            }],
            buttons: [
                {
                    text: '关闭',
                    handler: function (btn) {
                        btn.up('window').close();
                    }
                }
            ]
        }).show().focus();
    }
});
