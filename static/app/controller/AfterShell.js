Ext.define('OnionSpace.controller.AfterShell', {
    extend: 'Ext.app.Controller',
    views: ['after-shell.after-shell'],
    init: function () {
        this.control({
            'generate': {
                render: this.onPanelRendered
            }
        });
    },
    onPanelRendered: function (dom) {
    }
});
