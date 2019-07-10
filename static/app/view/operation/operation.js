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
        xtype: 'combobox',
        fieldLabel: '按模板搜索',
        labelWidth: 90,
        flex: 1,
        store: {
            fields: ['id', 'text'],
            data: parentData.getAll()
        },
        name: 'type',
        queryMode: 'local',
        displayField: 'text',
        valueField: 'id',
        listeners: {
            select: function (combo, record) {
                const grid = combo.up('operation');
                grid.getStore().setData(operation.find(record.id));
            }
        },
        triggers: {
            clear: {
                cls: 'x-form-clear-trigger',
                weight: -1,
                handler: function (d) {
                    d.clearValue();
                    const grid = d.up('operation');
                    grid.getStore().setData(operation.getAll());
                }
            }
        }
    }],
    selType: 'checkboxmodel',
    initComponent: function () {
        const that = this;
        console.log(that.getController())
        this.store = Ext.create('Ext.data.Store', {
            storeId: 'id',
            fields: ['pId', 'name', 'date', 'id'],
            data: operation.getAll(),
            sorters: [{
                property: 'date',
                direction: 'desc'
            }]
        });
        this.columns = [
            new Ext.grid.RowNumberer(),
            {text: '名称', align: 'center', dataIndex: 'name', flex: 1},
            {text: '操作日期', align: 'center', dataIndex: 'date', flex: 1},
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
                            operation.deleteById(data.id);
                            that.store.setData(operation.getAll());
                        }, this, Ext.MessageBox.ERROR);
                    }
                }, {
                    icon: 'images/undo.svg',
                    tooltip: '撤销操作',
                    handler: function (view, recIndex, cellIndex, item, e, {data}) {
                        showConfirm(`是否撤销${data.name + data.date}操作?`, function (text) {
                            const rows = operation.findDetail(data.id);
                            rows.map(r => {
                                if (r.oldContent === null) {
                                    utils.unLinkFile(r.file);
                                } else {
                                    utils.createFile(r.file, r.oldContent);
                                }
                            });
                            toast('撤销成功!');
                        }, this, Ext.MessageBox.ERROR);
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
        const that = this;
        Ext.create('Ext.window.Window', {
            title: '模板说明',
            width: '80%',
            layout: 'fit',
            maximizable: true,
            items: [{
                xtype: 'grid',
                store: Ext.create('Ext.data.Store', {
                    storeId: 'tempId',
                    fields: ['pId', 'date', 'type', 'file', 'tempId', 'content', 'oldContent', 'oldHtml'],
                    data: operation.findDetail(data.id),
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
                            if (record.data.oldContent === null) {
                                return `添加[${record.data.type}]`;
                            }
                            return `修改[${record.data.type}]`;
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
                                    if (data.oldContent === null) {
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
