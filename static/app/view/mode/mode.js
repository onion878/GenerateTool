Ext.define('MyAppNamespace.view.mode.mode', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.mode',
    scrollable: true,
    layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },
    initComponent: function () {
        this.tbar = [{
            xtype: 'button',
            action: 'add',
            tooltip: '添加数据',
            text: '添加'
        }, {
            xtype: 'button',
            action: 'save',
            tooltip: '保存模板',
            text: '保存'
        }];

        this.callParent(arguments);
    }
});