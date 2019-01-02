Ext.define('MyAppNamespace.view.setting.setting', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.setting',
    viewModel: true,
    layout: 'fit',
    codeEditor: null,
    listeners: {
        render: function (c) {
        }
    },
    items: [{
        xtype: 'fieldset',
        title: '基本设置',
        checkboxToggle: true,
        defaultType: 'checkbox', // each item will be a checkbox
        layout: 'anchor',
        defaults: {
            anchor: '100%',
            hideEmptyLabel: false
        },
        items: [{
            xtype: 'filefield',
            name: 'terminal',
            fieldLabel: 'Terminal'
        }]
    }],
    initComponent: function () {
        const pId = this.pId, that = this;
        this.callParent(arguments);
    }
});