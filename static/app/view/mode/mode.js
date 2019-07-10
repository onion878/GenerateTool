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
                text: '添加'
            }, {
                xtype: 'button',
                action: 'sort',
                tooltip: '数据模板排序',
                text: '排序'
            }, {
                xtype: 'button',
                action: 'reload',
                tooltip: '重新执行数据获取代码',
                text: '重载数据'
            }]
        };
        this.callParent(arguments);
    }
});
