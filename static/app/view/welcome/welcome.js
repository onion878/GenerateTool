Ext.define('MyAppNamespace.view.welcome.welcome', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.welcome',
    html: `<iframe width="100%" height="100%" frameBorder="0" src="https://generate-docs.netlify.com/"></iframe>`,
    initComponent: function () {
        this.callParent(arguments);
    }
});
