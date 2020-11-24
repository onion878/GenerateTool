Ext.define('OnionSpace.view.online-temp.online-temp', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.online-temp',
    requires: [
        'OnionSpace.controller.OnlineTemp',
        'OnionSpace.store.OnlineTemp'
    ],
    controller: 'OnlineTemp',
    store: {
        type: 'OnlineTemp'
    },
    viewModel: true,
    codeEditor: null,
    plugins: [{
        ptype: 'rowexpander',
        rowBodyTpl: ['<p><b>描述:</b> {Info}</p><p><b>更新日志:</b> {Detail}</p>']
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
    initComponent: function () {
        const pId = this.pId;
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
                align: 'center',
                xtype: 'widgetcolumn',
                width: 100,
                widget: {
                    xtype: 'toolbar',
                    style: {
                        background: 'transparent',
                        padding: '0'
                    },
                    layout: {
                        pack: 'center'
                    },
                    items: [
                        {
                            xtype: 'button',
                            icon: 'images/download.svg',
                            tooltip: '下载最新',
                            handler: function (btn) {
                                const data = btn.up().getWidgetRecord().getData();
                                showConfirm(`是否下载[${data.Name}]?`, function (text) {
                                    Ext.getCmp('main-content').mask('下载中, 请稍等...');
                                    Ext.Ajax.request({
                                        url: execute('userConfig', 'getUrl') + '/getNewest/' + data.Id,
                                        method: 'POST',
                                        success: function (response) {
                                            const jsonResp = Ext.util.JSON.decode(response.responseText);
                                            const local = execute('parentData', 'getByServeId', [jsonResp.Pid]);
                                            utils.downloadFile(jsonResp.User + '/' + jsonResp.Id + '.zip', jsonResp.Id + '.zip').then(d => {
                                                if (local == null) {
                                                    jsCode.importModule(d, "", data.Id, jsonResp.Id).then(({msg, pId}) => {
                                                        showToast('[success] [' + data.Name + ']下载成功!');
                                                        jsCode.deleteFile(d);
                                                        ipcRenderer.send('runCode', {type: 'refreshFile'});
                                                        setTimeout(() => {
                                                            Ext.getCmp('main-content').unmask();
                                                            showConfirm(`下载成功,是否切换到[${data.Name}]模板?`, function (text) {
                                                                changeTemplate(pId);
                                                            }, undefined, Ext.MessageBox.QUESTION);
                                                        }, 500);
                                                    }).catch(e => {
                                                        console.error(e);
                                                        Ext.getCmp('main-content').unmask();
                                                        showError(e);
                                                        jsCode.deleteFile(d);
                                                    });
                                                } else {
                                                    jsCode.updateTemplate(d, local, jsonResp).then(msg => {
                                                        showToast('[success] [' + data.Name + ']下载成功!');
                                                        jsCode.deleteFile(d);
                                                        if (pId == local.id) {
                                                            changeTemplate(local.id);
                                                            return;
                                                        }
                                                        setTimeout(() => {
                                                            Ext.getCmp('main-content').unmask();
                                                            showConfirm(`更新成功,是否切换到[${data.Name}]模板?`, function (text) {
                                                                changeTemplate(local.id);
                                                            }, undefined, Ext.MessageBox.QUESTION);
                                                        }, 500);
                                                    }).catch(e => {
                                                        console.error(e);
                                                        Ext.getCmp('main-content').unmask();
                                                        showError(e);
                                                        jsCode.deleteFile(d);
                                                    });
                                                }
                                            }).catch(err => {
                                                console.error(err);
                                                Ext.getCmp('main-content').unmask();
                                                showError('[error] ' + err);
                                            });
                                        },
                                        failure: function (response) {
                                            Ext.getCmp('main-content').unmask();
                                            Ext.MessageBox.show({
                                                title: '错误',
                                                msg: response.message,
                                                buttons: Ext.MessageBox.OK,
                                                icon: Ext.MessageBox['ERROR']
                                            });
                                        }
                                    });
                                }, btn, Ext.MessageBox.QUESTION);
                            }
                        },'-',
                        {
                            xtype: 'button',
                            tooltip: '详情',
                            icon: 'images/view.svg',
                            handler: function (btn) {
                                const data = btn.up().getWidgetRecord().getData();
                                const p = btn.up('grid');
                                p.mask('加载中...');
                                Ext.require(controllers['detail-temp'], function () {
                                    p.unmask();
                                    Ext.create('Ext.window.Window', {
                                        title: '模板说明',
                                        width: '75%',
                                        height: '75%',
                                        layout: 'fit',
                                        resizable: true,
                                        maximizable: true,
                                        constrain: true,
                                        modal: true,
                                        animateTarget: btn,
                                        items: [{
                                            xtype: 'detail-temp',
                                            dataId: data.Id,
                                            pId: pId
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
                                });
                            }
                        }
                    ]
                }
            }
        ];
        this.callParent(arguments);
    }
});
