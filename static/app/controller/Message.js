Ext.define('MyAppNamespace.controller.Message', {
    extend: 'Ext.app.Controller',
    views: ['message.message'],
    init: function () {
        this.control({
            'message': {
                render: this.onPanelRendered
            }
        });
    },
    onPanelRendered: function () {

    }
});
