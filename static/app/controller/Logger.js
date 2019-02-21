Ext.define('OnionSpace.controller.Logger', {
    extend: 'Ext.app.Controller',
    views: ['logger.logger'],
    init: function () {
        this.control({
            'logger': {
                render: this.onPanelRendered
            }
        });
    },
    onPanelRendered: function () {

    }
});
