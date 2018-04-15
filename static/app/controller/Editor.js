Ext.define('MyAppNamespace.controller.Editor', {
    extend: 'Ext.app.Controller',
    views: ['editor.editor'],
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