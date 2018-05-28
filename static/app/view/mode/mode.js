Ext.define('MyAppNamespace.view.mode.mode', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.mode',
    scrollable: true,
    layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },
    cls: 'mode-controls',
    initComponent: function () {
        this.tbar = [{
            xtype: 'button',
            action: 'add',
            tooltip: '添加数据模板',
            text: '添加'
        }];
        this.callParent(arguments);
    }
});