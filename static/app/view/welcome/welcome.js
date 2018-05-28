
Ext.define('MyAppNamespace.view.welcome.welcome', {
    extend : 'Ext.panel.Panel',
    alias : 'widget.welcome',
    html: `
    <h1>欢迎使用</h1>
    
    `,
    initComponent : function() {
        this.callParent(arguments);
    }
});