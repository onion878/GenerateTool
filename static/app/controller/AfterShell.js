Ext.define('OnionSpace.controller.AfterShell', {
    extend: 'Ext.app.Controller',
    views: ['after-shell.after-shell'],
    init: function () {
        this.control({
            'after-shell': {
                render: this.onPanelRendered
            }
        });
    },
    onPanelRendered: function (dom) {
    }
});
