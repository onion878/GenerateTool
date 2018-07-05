Ext.define('MyAppNamespace.view.unpkg.unpkg', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.unpkg',
    tbar: [{
        xtype: 'button',
        text: '删除',
        icon: 'images/delete.png',
        action: 'deletePkg'
    }, {
        xtype: 'button',
        text: '刷新',
        icon: 'images/arrow_refresh_small.png',
        action: 'refresh'
    }, {
        xtype: 'button',
        text: '安装',
        icon: 'images/coins_add.png',
        action: 'installAll'
    }],
    selType: 'checkboxmodel',
    initComponent: function () {
        const pId = this.pId;
        this.store = Ext.create('Ext.data.Store', {
            storeId: 'id',
            fields: ['pId', 'name', 'version', 'date', 'id'],
            data: packageConfig.getAll(pId)
        });
        this.columns = [
            new Ext.grid.RowNumberer(),
            {text: '名称', align: 'center', dataIndex: 'name', flex: 1},
            {text: '版本', align: 'center', dataIndex: 'version', flex: 1},
            {text: '安装日期', align: 'center', dataIndex: 'date', flex: 1},
            {
                xtype: 'actioncolumn',
                width: 60,
                text: '操作',
                sortable: false,
                align: 'center',
                items: [{
                    icon: 'images/delete.png',
                    tooltip: '删除',
                    handler: function (view, recIndex, cellIndex, item, e, {data}) {
                        const el = this.up('unpkg').getEl(), that = this;
                        showConfirm(`是否删除包[${data.name}@${data.version}]?`, function (text) {
                            el.mask('删除中...');
                            jsCode.unInstallPkg(pId, data.name).then( name => {
                                el.unmask();
                                showToast(`${name},删除成功!`);
                                const grid = that.up('unpkg');
                                grid.getStore().setData(packageConfig.getAll(pId));
                            }).catch( e => {
                                el.unmask();
                                showError(`删除失败-> ${e}`);
                            });
                        }, this, Ext.MessageBox.ERROR);
                    }
                }, {
                    icon: 'images/coins_add.png',
                    tooltip: '安装最新版',
                    handler: function (view, recIndex, cellIndex, item, e, {data}) {
                        const el = this.up('unpkg').getEl();
                        el.mask('安装中...');
                        jsCode.downloadPkg(pId, data.name).then(fileName => {
                            el.unmask();
                            showToast(`${fileName},安装成功!`);
                        }).catch(e => {
                            el.unmask();
                            showError(`安装失败-> ${e}`);
                        });
                    }
                }]
            }
        ];
        this.callParent(arguments);
    }
});