Ext.define('OnionSpace.view.detail-temp.detail-temp', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.detail-temp',
    viewModel: true,
    codeEditor: null,
    store: 'DetailTemp',
    plugins: [{
        ptype: 'rowexpander',
        rowBodyTpl: ['<p><b>更新日志:</b> {Info}</p>']
    }],
    tbar: [{
        xtype: 'textfield',
        width: '100%',
        emptyText: '名称',
        action: 'search'
    }],
    bbar: {
        xtype: 'pagingtoolbar',
        displayInfo: true
    },
    listeners: {
        render: function (c) {
            const store = c.getStore();
            store.getProxy().extraParams = {pid: c.dataId};
            store.load();
        }
    },
    initComponent: function () {
        this.columns = [
            new Ext.grid.RowNumberer(),
            {text: '名称', align: 'center', dataIndex: 'Name', flex: 1},
            {text: '作者', align: 'center', dataIndex: 'User', flex: 1},
            {
                text: '更新日期', align: 'center', dataIndex: 'Created', flex: 1, renderer: function (v) {
                    return v.substring(0, 19);
                }
            },
            {
                text: '操作',
                flex: 1,
                align: 'center',
                xtype: 'actioncolumn',
                items: [
                    {
                        xtype: 'button',
                        icon: 'images/download.svg',
                        tooltip: '下载',
                        handler: function (view, recIndex, cellIndex, item, e, {data}) {
                            const btn = this;
                            showConfirm(`是否下载[${data.Name}]?`, function (text) {
                                btn.up('detail-temp').up('window').close();
                                Ext.getBody().mask('下载中, 请稍等...');
                                const local = parentData.getByServeId(data.Pid);
                                utils.downloadFile(data.User + '/' + data.Id + '.zip', data.Id + '.zip').then(d => {
                                    if (local === undefined) {
                                        jsCode.importModule(d, "", data.Pid, data.Id).then(({msg, pId}) => {
                                            Ext.getBody().unmask();
                                            showToast('[info] [' + data.Name + ']下载成功!');
                                            jsCode.deleteFile(d);
                                            showConfirm(`下载成功,是否切换到[${data.Name}]模板,并安装Lib?`, function (text) {
                                                changeTemplate(pId, true);
                                            }, null, Ext.MessageBox.QUESTION);
                                        }).catch(e => {
                                            console.error(e);
                                            Ext.getBody().unmask();
                                            showError(e);
                                            jsCode.deleteFile(d);
                                        });
                                    } else {
                                        jsCode.updateTemplate(d, local, data).then(msg => {
                                            Ext.getBody().unmask();
                                            showToast('[info] [' + data.Name + ']更新成功!');
                                            jsCode.deleteFile(d);
                                            if (history.getMode() == local.id) {
                                                changeTemplate(local.id, true);
                                                return;
                                            }
                                            showConfirm(`更新成功,是否切换到[${data.Name}]模板,并安装Lib?`, function (text) {
                                                changeTemplate(local.id, true);
                                            }, view, Ext.MessageBox.QUESTION);
                                        }).catch(e => {
                                            console.error(e);
                                            Ext.getBody().unmask();
                                            showError(e);
                                            jsCode.deleteFile(d);
                                        });
                                    }
                                }).catch(err => {
                                    console.error(err);
                                    Ext.getBody().unmask();
                                    showError('[error] ' + err);
                                });
                            }, this, Ext.MessageBox.QUESTION);
                        }
                    }
                ]
            }
        ];
        this.callParent(arguments);
    }
});
