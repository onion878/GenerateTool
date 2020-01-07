Ext.define('OnionSpace.view.help.help', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.help',
    layout: 'fit',
    scrollable: true,
    margin: 5,
    listeners: {
        render: function (c) {
            Ext.select('.x-panel-selectable').selectable();
        }
    },
    initComponent: function () {
        this.html = `<div class="x-panel-selectable">${utils.showHelp(this.id)}</div>`;
        this.callParent(arguments);
    }
});
