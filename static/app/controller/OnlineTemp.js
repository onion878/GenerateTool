Ext.define('OnionSpace.controller.OnlineTemp', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.OnlineTemp',
    init: function () {
        this.control({
            'toolbar textfield[action=search]': {
                change: this.query
            },
            'toolbar button[action=managerAuth]': {
                click: this.managerAuth
            },
            'toolbar button[action=addAuth]': {
                click: this.addAuth
            }
        });
    },
    query: function (dom, val) {
        const grid = dom.up('gridpanel');
        const store = grid.getStore();
        var list = execute('userConfig', 'getAuthCode');
        store.getProxy().extraParams = {name: val, other: list.join(','), size: 30};
        store.load();
    },
    addAuth: function (btn) {
        const that = this;
        Ext.create('Ext.window.Window', {
            title: '添加授权码',
            fixed: true,
            width: 300,
            layout: 'fit',
            resizable: false,
            animateTarget: btn,
            constrain: true,
            modal: true,
            items: {
                xtype: 'textfield',
                margin: '10',
                listeners: {
                    afterrender: function (field) {
                        Ext.defer(function () {
                            field.focus(true, 100);
                        }, 1);
                    }
                }
            },
            buttonAlign: 'center',
            buttons: [{
                text: '确定',
                handler: function () {
                    const field = this.up('window').down('textfield');
                    const text = field.getRawValue();
                    if (utils.isEmpty(text)) {
                        Ext.toast({
                            html: `<span style="color: red;">请输入授权码!</span>`,
                            autoClose: true,
                            align: 't',
                            slideDUration: 400,
                            maxWidth: 400
                        });
                        return;
                    }
                    execute('userConfig', 'setAuthCode', [text]);
                    this.up('window').close();
                    that.refreshData(btn);
                }
            }, {
                text: '取消',
                handler: function () {
                    this.up('window').close();
                }
            }]
        }).show().focus();
    },
    managerAuth: function (btn) {
        const that = this;
        let list = execute('userConfig', 'getAuthCode');
        const data = [];
        list.forEach(l => {
            data.push({name: l});
        });
        Ext.create('Ext.window.Window', {
            title: '管理授权码',
            fixed: true,
            width: 350,
            maxHeight: 450,
            layout: 'fit',
            animateTarget: btn,
            resizable: false,
            constrain: true,
            modal: true,
            items: {
                xtype: 'grid',
                layout: 'fit',
                columnLines: true,
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
                        dataIndex: 'name',
                        flex: 1
                    },
                    {
                        xtype: 'actioncolumn',
                        width: 80,
                        text: '操作',
                        sortable: false,
                        align: 'center',
                        items: [{
                            icon: 'images/cross.svg',
                            tooltip: '删除',
                            handler: function (view, recIndex, cellIndex, item, e, {data}) {
                                const deleteBtn = this;
                                showConfirm(`是否删除[${data.name}]授权码?`, function (text) {
                                    execute('userConfig', 'deleteAuthCode', [data.name]);
                                    deleteBtn.up('window').close();
                                    that.refreshData(btn);
                                }, e.target, Ext.MessageBox.ERROR);
                            }
                        }]
                    }
                ],
                buttonAlign: 'center',
                buttons: [{
                    text: '确定',
                    handler: function () {
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
    refreshData: function (btn) {
        const grid = btn.up('gridpanel');
        const store = grid.getStore();
        var list = execute('userConfig', 'getAuthCode');
        store.getProxy().extraParams = {other: list.join(','), size: 30};
        store.load();
    }
});
