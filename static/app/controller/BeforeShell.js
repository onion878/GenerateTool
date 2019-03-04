Ext.define('OnionSpace.controller.BeforeShell', {
    extend: 'Ext.app.Controller',
    views: ['before-shell.before-shell'],
    init: function () {
        this.control({
            'before-shell': {
                render: this.onPanelRendered
            }
        });
    },
    onPanelRendered: function (dom) {
    }
});
