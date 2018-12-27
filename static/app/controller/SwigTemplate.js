Ext.define('MyAppNamespace.controller.SwigTemplate', {
    extend: 'Ext.app.Controller',
    views: ['swig-template.swig-template'],
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