Ext.define('MyAppNamespace.controller.Code', {
    extend: 'Ext.app.Controller',
    views: ['code.code'],
    init: function () {
        this.control({
            'code': {
                render: this.onPanelRendered
            }
        });
    },
    onPanelRendered: function () {

    }
});