Ext.define('OnionSpace.view.unpkg.unpkg', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.unpkg',
    requires: [
        'OnionSpace.controller.Unpkg'
    ],
    controller: 'Unpkg',
    tbar: [{
        xtype: 'button',
        text: '删除',
        icon: 'images/cross.svg',
        action: 'deletePkg'
    }, {
        xtype: 'button',
        text: '刷新',
        icon: 'images/refresh.svg',
        action: 'refresh'
    }, {
        xtype: 'button',
        text: '安装所有',
        icon: 'images/data-add.svg',
        action: 'installAll'
    }],
    selType: 'checkboxmodel',
    initComponent: function () {
        const pId = this.pId, that = this;
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
                    icon: 'images/cross.svg',
                    tooltip: '删除',
                    handler: function (view, recIndex, cellIndex, item, e, {data}) {
                        showConfirm(`是否删除包[${data.name}@${data.version}]?`, function (text) {
                            jsCode.deletePkg(pId, data.name).then(f => {
                                const grid = view.up('unpkg');
                                grid.getStore().setData(packageConfig.getAll(grid.pId));
                            });
                            that.runCommand('uninstall', pId, data.name);
                        }, this, Ext.MessageBox.ERROR);
                    }
                }, {
                    icon: 'images/data-add.svg',
                    tooltip: '安装最新版',
                    handler: function (view, recIndex, cellIndex, item, e, {data}) {
                        Ext.toast({
                            html: '安装中...',
                            closable: false,
                            align: 't',
                            slideInDuration: 400
                        });
                        that.runCommand('install', pId, data.name);
                    }
                }]
            }
        ];
        this.callParent(arguments);
    },
    runCommand(type, pId, name, version) {
        if (version != undefined) {
            name = name + '@' + version;
        }
        if (Ext.getCmp('terminal').hidden) {
            document.getElementById('terminal-btn').click();
            const folder = jsCode.getFolder(pId);
            command.cdTargetFolder(folder);
            command.write('npm ' + type + ' ' + name);
        } else {
            command.write('npm ' + type + ' ' + name);
        }
    }
});
