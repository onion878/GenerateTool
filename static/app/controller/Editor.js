Ext.define('MyAppNamespace.controller.Editor', {
    extend: 'Ext.app.Controller',
    views: ['editor.editor'],
    init: function () {
        this.control({
            'editor': {
                render: this.onPanelRendered
            }
        });
    },
    onPanelRendered: function () {

    }
});