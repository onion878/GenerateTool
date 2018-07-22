Ext.define('MyAppNamespace.view.templet.templet', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.templet',
    tbar: [{
        xtype: 'button',
        text: '刷新',
        icon: 'images/arrow_refresh_small.png',
        action: 'refreshGrid'
    }, {
        xtype: 'button',
        text: '导入',
        icon: 'images/coins_add.png',
        action: 'importModule'
    }],
    initComponent: function () {
        const pId = this.pId;
        this.store = Ext.create('Ext.data.Store', {
            storeId: 'id',
            fields: ['id', 'text'],
            data: parentData.getAll()
        });
        this.plugins = {
            ptype: 'rowediting',
            clicksToMoveEditor: 1,
            autoUpdate: true,
            autoCancel: false,
            listeners: {
                edit: function (editor, e, eOpts) {
                    e.record.commit();
                    editor.grid.getStore().getData().items.forEach(({data}) => {
                        parentData.updateText(data);
                    });
                }
            }
        };
        this.columns = [
            new Ext.grid.RowNumberer(),
            {
                text: '名称', align: 'center', dataIndex: 'text', flex: 1, editor: {
                    xtype: 'textfield'
                }
            },
            {
                text: '操作',
                width: 100,
                align: 'center',
                xtype: 'widgetcolumn',
                widget: {
                    xtype: 'container',
                    items: [
                        {
                            xtype: 'button',
                            text: '导出',
                            handler: function (btn) {
                                const data = btn.up().getWidgetRecord().getData();
                                const remote = require('electron').remote;
                                const dialog = remote.dialog;
                                dialog.showOpenDialog({properties: ['openDirectory']}, (folder) => {
                                    if (folder != undefined && !utils.isEmpty(folder[0])) {
                                        data.folder = folder[0];
                                        const el = btn.up('templet').getEl();
                                        el.mask('导出中...');
                                        jsCode.exportModule(data).then(t => {
                                            el.unmask();
                                            showToast(`导出为[${data.folder}\\${data.text}.zip]`);
                                        }).catch(err => {
                                            console.log(err);
                                            showError(err);
                                            el.unmask();
                                        });
                                    }
                                });
                            }
                        },
                        {
                            xtype: 'button',
                            text: '删除',
                            handler: function (btn) {
                                const data = btn.up().getWidgetRecord().getData();
                                showConfirm(`是否删除模板[${data.text}]?`, function (text) {
                                    jsCode.removeModule(data.id);
                                    btn.up('templet').getStore().setData(parentData.getAll());
                                    if(data.id == history.getMode()) {
                                        history.setMode('');
                                    }
                                    showToast('删除成功请重载界面!');
                                }, this, Ext.MessageBox.ERROR);
                            }
                        }
                    ]
                }
            }
        ];
        this.callParent(arguments);
    }
});