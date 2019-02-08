Ext.define('MyAppNamespace.view.welcome.welcome', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.welcome',
    listeners: {
        render: function (c) {
            c.mask('加载中...');
            Ext.Ajax.request({
                url: 'https://raw.githubusercontent.com/onion878/GenerateTool/master/index.html',
                success: function (response) {
                    c.unmask();
                    c.update(response.responseText);
                }
            });
        }
    },
    initComponent: function () {
        this.callParent(arguments);
    }
});
