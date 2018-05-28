Ext.define('MyAppNamespace.controller.Minicode', {
    extend: 'Ext.app.Controller',
    views: ['minicode.minicode'],
    init: function () {
        this.control({
            'minicode': {
                render: this.onPanelRendered
            }
        });
    },
    onPanelRendered: function () {

    }
});