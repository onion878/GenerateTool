Ext.define('OnionSpace.controller.Statusbar', {
    extend: 'Ext.app.Controller',
    views: ['statusbar.statusbar'],
    init: function () {
        this.control({
            'statusbar': {
                render: this.onPanelRendered
            }
        });
    },
    onPanelRendered: function () {

    }
});
