Ext.define('OnionSpace.controller.DetailTemp', {
    extend: 'Ext.app.Controller',
    views: ['detail-temp.detail-temp'],
    models: ['DetailTemp'],
    stores: ['DetailTemp'],
    init: function () {
        this.control({
            'detail-temp': {
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
        store.getProxy().extraParams = {q: val, name: val, pid: grid.dataId, size: 30};
        store.load();
    },
    onPanelRendered: function () {

    }
});
