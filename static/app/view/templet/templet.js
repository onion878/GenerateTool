Ext.define('OnionSpace.view.templet.templet', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.templet',
    tbar: [{
        xtype: 'button',
        text: '刷新',
        icon: 'images/arrow_refresh_small.png',
        action: 'refreshGrid'
    }, {
        xtype: 'button',
        text: '导入模板',
        icon: 'images/import.png',
        action: 'importModule'
    }, {
        xtype: 'button',
        text: '复制模板',
        icon: 'images/copy.png',
        action: 'copyModule'
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
                text: '创建时间', align: 'center', dataIndex: 'date', flex: 1
            },
            {
                text: '操作',
                flex: 1,
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
                                            console.error(err);
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
                                let msg = `是否删除模板[${data.text}]?`, flag = false;
                                if (data.id == history.getMode()) {
                                    flag = true;
                                    msg = `删除当前模板[${data.text}]系统会重新启动,是否继续?`;
                                }
                                showConfirm(msg, function (text) {
                                    const el = btn.up('templet').getEl();
                                    el.mask('处理中...');
                                    jsCode.removeModule(data.id).then(() => {
                                        btn.up('templet').getStore().setData(parentData.getAll());
                                        if (flag) {
                                            history.setMode('');
                                            history.removeAll();
                                            el.unmask();
                                            const {app} = require('electron').remote;
                                            app.relaunch();
                                            app.exit(0);
                                        } else {
                                            el.unmask();
                                            showToast('[info] 删除成功!');
                                        }
                                    });
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
