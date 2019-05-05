Ext.define('OnionSpace.view.welcome.welcome', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.welcome',
    html: '',
    margin: 10,
    scrollable: true,
    initComponent: function () {
        this.html = utils.showUpdate();
        this.callParent(arguments);
    }
});
