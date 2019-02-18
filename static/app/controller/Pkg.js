Ext.define('OnionSpace.controller.Pkg', {
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
        const grid = dom.up('gridpanel');
        const store = grid.getStore();
        store.getProxy().extraParams = {q: val, size: 20};
        store.load();
    },
    onPanelRendered: function () {

    }
});
