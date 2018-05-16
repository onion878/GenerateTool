Ext.define('MyAppNamespace.controller.Minicode', {
    extend: 'Ext.app.Controller',
    views: ['minicode.minicode'],
    init: function () {
        this.control({
            'viewport > panel': {
                render: this.onPanelRendered
            }
        });
    },
    onPanelRendered: function () {

    }
});