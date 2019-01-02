Ext.define('MyAppNamespace.controller.Setting', {
    extend: 'Ext.app.Controller',
    views: ['setting.setting'],
    init: function () {
        this.control({
            'setting': {
                render: this.onPanelRendered
            }
        });
    },
    onPanelRendered: function () {

    }
});