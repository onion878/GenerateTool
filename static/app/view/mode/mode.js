Ext.define('OnionSpace.view.mode.mode', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.mode',
    requires: [
        'OnionSpace.controller.Mode'
    ],
    controller: 'Mode',
    scrollable: true,
    layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },
    cls: 'mode-controls',
    initComponent: function () {
        this.tbar = {
            dock: 'top',
            layout: {
                pack: 'center'
            },
            items: [{
                xtype: 'button',
                action: 'add',
                tooltip: '添加数据模板',
                text: '添加',
                icon: 'images/add.svg'
            }, {
                xtype: 'button',
                action: 'sort',
                tooltip: '数据模板排序',
                text: '排序',
                icon: 'images/switch.svg'
            }, {
                xtype: 'button',
                action: 'export',
                tooltip: '将当前模板数据导出为json',
                text: '导出数据',
                icon: 'images/export.svg'
            }, {
                xtype: 'button',
                action: 'import',
                tooltip: '导入json数据显示',
                text: '导入数据',
                icon: 'images/import.svg'
            }, {
                xtype: 'button',
                action: 'reload',
                tooltip: '重新执行数据获取代码',
                text: '重载数据',
                icon: 'images/refresh.svg'
            }, {
                xtype: 'button',
                action: 'showHistory',
                tooltip: '查看执行的历史数据',
                text: '历史数据',
                icon: 'images/history.svg'
            }]
        };
        this.callParent(arguments);
    }
});
