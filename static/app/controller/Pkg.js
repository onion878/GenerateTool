Ext.define('MyAppNamespace.controller.Pkg', {
    extend: 'Ext.app.Controller',
    views: ['pkg.pkg'],
    models: ['Pkg'],
    stores: ['Pkg'],
    init: function () {
        this.control({
            'pkg': {
                render: this.onPanelRendered
            },
            'toolbar textfield[action=search]': {
                change: this.query
            }
        });
    },
    query: function (dom, val) {
        var grid = dom.up('gridpanel');
        var store = grid.getStore();
        store.getProxy().extraParams = {q: val, size: 20};
        store.load();
    },
    onPanelRendered: function () {

    }
});